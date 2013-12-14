<?php

/* Rename this file to "settings.php" and fill the proper values. */

class Settings
{
    /* Choose your USOS API server from the list on the bottom of this page:
     * https://usosapps.uw.edu.pl/developers/api/definitions/installations/
     * Insert the exact value of its "Base URL" below. */

    public static $USOSAPI_BASE_URL = 'https://usosapps.uw.edu.pl/';
    
    /* What should appear in Access-Control-Allow-Origin header served by
     * our proxy? Note: this is an array. */
    
    public static $ACCESS_CONTROL_ORIGINS = array('*');
    
    /* Go to $USOSAPI_BASE_URL/developers/ page
     * (e.g. https://usosapps.uw.edu.pl/developers/) and fill the "Sign up for
     * an API key" form. You will get two keys. Insert them below. */

    public static $USOSAPI_CONSUMER_KEY = 'your_key';
    public static $USOSAPI_CONSUMER_SECRET = 'your_secret';

    public static $DEBUG = false;
}
