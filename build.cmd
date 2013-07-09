rem * You won't need it unless you're a jQuery-USOS developer, just use
rem * js/jquery.usos-XYZ.min.js file!

rem * This is a simple build script template. I use it to build a new
rem * version from the sources kept in my copy of the USOSweb project.
rem * Currently this works in my personal environent only.

set VERSION=0.9.8

set USOSWEB=D:/PRIV/Projekty/usosweb
set DEST=D:/PRIV/Projekty/jquery-usos
set YUICOMPRESSOR=%DEST%/yuicompressor-2.4.2.jar

set BUILDTARGET=%DEST%/js/jquery-usos-%VERSION%.min.js
set BUILDTARGET2=%DEST%/js/jquery-usos-%VERSION%-bundle.min.js
set BUILDTARGET2COPY=%DEST%/jsfiddle-demos/latest-bundle.min.js

rem * Copy new JS development files, remove the old ones. Remove old production
rem * packages from the development USOSweb site. Copy the current libraries.

rm %DEST%/js/jquery-usos*
rm %DEST%/js/devel/*
cp %USOSWEB%/www/js/jquery-usos/devel/*.js %DEST%/js/devel
rm %USOSWEB%/www/js/jquery-usos/jquery-usos-*
cp %USOSWEB%/www/js/jquery-usos/* %DEST%/js

rem * Copy new CSS and images.

rm -R %DEST%/css/jquery-usos
cp -R %USOSWEB%/www/css/jquery-usos %DEST%/css
rm -R %DEST%/css/jquery-ui-theme
cp -R %USOSWEB%/www/css/theme %DEST%/css/jquery-ui-theme

rem * Merge all jquery-USOS development files into one minified library
rem * (this will NOT include external libs).

cat %DEST%/js/devel/* > %DEST%/js/tmp1.js
java -jar %YUICOMPRESSOR% --charset utf-8 --type js %DEST%/js/tmp1.js > %DEST%/js/tmp2.js
echo /** jQuery-USOS %VERSION% -- https://github.com/MUCI/jquery-usos */ > %DEST%/js/tmp3.js
cat %DEST%/js/tmp2.js >> %DEST%/js/tmp3.js
mv %DEST%/js/tmp3.js %BUILDTARGET%
rm %DEST%/js/tmp*.js

rem * Create the "bundle" package.

echo /** > %BUILDTARGET2%
echo  * jQuery-USOS *BUNDLE VERSION* -- this file includes all jQuery-USOS >> %BUILDTARGET2%
echo  * JavaScript dependencies except jQuery and jQuery-UI. >> %BUILDTARGET2%
echo  */ >> %BUILDTARGET2%
echo. >> %BUILDTARGET2%
cat %DEST%/js/jquery.ba-bbq-1.2.1.min.js >> %BUILDTARGET2%
echo. >> %BUILDTARGET2%
cat %DEST%/js/jquery.colResizable-1.3.min.js >> %BUILDTARGET2%
echo. >> %BUILDTARGET2%
cat %DEST%/js/jquery.textext.1.3.1.min.js >> %BUILDTARGET2%
echo. >> %BUILDTARGET2%
cat %DEST%/js/jquery.tooltipster.2.1.min.js >> %BUILDTARGET2%
echo. >> %BUILDTARGET2%
cat %BUILDTARGET% >> %BUILDTARGET2%

rem * Copy the "bundle" to jsfiddle directory. This is done so that there's no
rem * need to update all resource URLs in demo pages (as the original URL
rem * contains the version number).

cp %BUILDTARGET2% %BUILDTARGET2COPY%

rem * Copy both ("official" and "bundle") packages back to USOSweb.

cp %BUILDTARGET% %USOSWEB%/www/js/jquery-usos
cp %BUILDTARGET2% %USOSWEB%/www/js/jquery-usos
