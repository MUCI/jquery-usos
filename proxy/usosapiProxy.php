<?php

/* Before you can use this proxy, you need to create the "settings.php" file.
 * See "settings-example.php" for more information. */

require_once 'settings.php';

if (Settings::$DEBUG) {
    error_reporting(E_ALL);
    ini_set("display_errors", 1);
}

class BadRequest extends Exception {}

/**
 * Signes all requests with local USOS API Consumer credentials, forwards them
 * to services/oauth/proxy method and prints the results.
 *
 * - This proxy was primarily designed to work with jQuery-USOS Demo pages, but
 *   it can also be used in other, simple projects.
 *   
 * - It DOES NOT protect against CSRF attacks. It can be safely used to read data,
 *   but not to change it.
 *   
 * - It DOES NOT sign the requests with OAuth Access Tokens (if you intend to add
 *   support for this, keep CSRF in mind!).
 */
class PublicAnonymousProxy
{
    public static function handleCurrentRequest()
    {
        try {
            try {
                self::internalHandleRequest();
            } catch (BadRequest $e) {
                header("HTTP/1.0 400 Bad Request");
                throw $e;
            } catch (Exception $e) {
                header("HTTP/1.0 500 Internal Server Error");
                throw $e;
            }
        } catch (Exception $e) {
            if (Settings::$DEBUG) {
                header("Content-Type: text/plain; charset=utf-8");
                print $e->getMessage();
            }
        }
    }

    private static function internalHandleRequest()
    {
    	foreach (Settings::$ACCESS_CONTROL_ORIGINS as $origin) {
        	header('Access-Control-Allow-Origin: '.$origin, false);
    	}

        if (!isset($_REQUEST['_method_'])) {
            throw new BadRequest("Missing _method_ parameter.");
        }
        $method = $_REQUEST['_method_'];

        header("Expires: Thu, 19 Nov 1981 08:52:00 GMT");
        header("Cache-Control: no-cache, no-store, must-revalidate, post-check=0, pre-check=0");
        header("Pragma: no-cache");

        $params = $_POST;
        unset($params['_method_']);

        $proxyMethod = 'services/oauth/proxy';
        $proxyParams = array(
            'method' => $method,
            'parameters' => (count($params) > 0) ? json_encode($params) : "{}"
        );

        self::makeRequestAndPrintResponse($proxyMethod, $proxyParams);
    }

    private static function makeRequestAndPrintResponse(
        $method, $params, $signature_method = OAUTH_SIG_METHOD_HMACSHA1
    ) {
        $oauth = new OAuth(
            Settings::$USOSAPI_CONSUMER_KEY,
            Settings::$USOSAPI_CONSUMER_SECRET,
            $signature_method,
            OAUTH_AUTH_TYPE_URI
        );
        if ($signature_method == OAUTH_SIG_METHOD_PLAINTEXT) {
            $oauth->setRequestEngine(OAUTH_REQENGINE_CURL);
        }
        if (Settings::$DEBUG) {
            $oauth->enableDebug();
        }
        $url = Settings::$USOSAPI_BASE_URL.$method;
        try {
            $oauth->fetch($url, $params, OAUTH_HTTP_METHOD_POST);
        } catch (OAuthException $E) {
            /* Ignored on purpose. $response_info will be filled either way. */
        }
        $response_info = $oauth->getLastResponseInfo();
        header("HTTP/1.0 {$response_info["http_code"]}");
        header("Content-Type: {$response_info["content_type"]}");
        print $oauth->getLastResponse();
    }
}

PublicAnonymousProxy::handleCurrentRequest();
