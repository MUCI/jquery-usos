module.exports = {
    paths: {
        examples: 'examples',
        examplesOut: 'htdocs',
        vendor: 'src/vendor',
        jquery: 'src/jquery',
        requireJS: 'src/js',
        requireEntities: 'src/js/entities',
        srcJS: 'src/jquery-usos.js',
        outJS: 'jquery-usos.min.js',
        outJSPath: 'lib/',
        srcCSS: 'src/css/jquery-usos.css',
        outCSS: 'lib/jquery-usos.css',
        srcAssetsPath: 'src/assets',
        srcAssets:  [
            './**/*.*'
        ],
        outAssets: 'lib/',
        filesToClear: [
            'htdocs/**/*.*',
            'lib/**/*.*'
        ],
        filesToWatch: 'src/**/*.*',
        buildCache: 'build-cache',
        exportProject: {
            in: {
                dist:   'lib/jquery-usos.min.js',
                vendor: 'src/vendor',
                devel:  'src/js',
                css:    'lib/jquery-usos.css',
                fonts:  'lib/fonts',
                images: 'lib/images'
            },
            out: {
                dist:   'www/js/jquery-usos/latest-bundle.min.js',
                vendor: 'www/js/jquery-usos',
                devel:  'www/js/jquery-usos/devel',
                css:    'www/css/jquery-usos/jquery-usos.css',
                fonts:  'www/css/jquery-usos/fonts',
                images: 'www/css/jquery-usos/images'
            }
        }
    },
    definitions: {
        'dev': {
            "$BANNER": " jQuery-USOS $VERSION -- https://github.com/MUCI/jquery-usos ",
            "$DEBUG": true
        },
        'prod': {
            "$BANNER": " jQuery-USOS $VERSION -- https://github.com/MUCI/jquery-usos ",
            "$DEBUG": false
        }
    }
};
