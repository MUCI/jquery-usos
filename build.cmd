rem * You won't need it unless you're a jQuery-USOS developer, just use
rem * js/jquery.usos-XYZ.min.js file!

rem * This is a simple build script template. I use it to build a new
rem * version from the sources kept in my copy of the USOSweb project.
rem * Currently this works in my personal environent only.

set VERSION=0.9.3

set USOSWEB=D:/PRIV/Projekty/usosweb
set DEST=D:/PRIV/Projekty/jquery-usos
set YUICOMPRESSOR=%DEST%/yuicompressor-2.4.2.jar

set BUILDTARGET=%DEST%/js/jquery.usos-%VERSION%.min.js
set BUILDTARGET2=%DEST%/jsfiddle-demos/bundle.min.js

rem * Copy new JS files.

rm %DEST%/js/jquery.usos*
cp %USOSWEB%/www/js/jquery.usos* %DEST%/js
rm %DEST%/js/jquery.usos-0*
rm %DEST%/js/jquery.usos-1*

rem * Copy new CSS and images.

rm -R %DEST%/css/jquery.usos
cp -R %USOSWEB%/www/css/jquery.usos %DEST%/css
rm -R %DEST%/css/jquery-ui-theme
cp -R %USOSWEB%/www/css/theme %DEST%/css/jquery-ui-theme

rem * Merge all jquery-USOS JS files into one minified library
rem * (this will NOT include external libs).

cat %DEST%/js/jquery.usos* > %DEST%/js/tmp1.js
java -jar %YUICOMPRESSOR% --charset utf-8 --type js %DEST%/js/tmp1.js > %DEST%/js/tmp2.js
echo /** jQuery-USOS %VERSION% -- https://github.com/MUCI/jquery-usos */ > %DEST%/js/tmp3.js
cat %DEST%/js/tmp2.js >> %DEST%/js/tmp3.js
mv %DEST%/js/tmp3.js %BUILDTARGET%
rm %DEST%/js/tmp*.js

rem * Copy the "official" package back to USOSweb.

cp %BUILDTARGET% %USOSWEB%/www/js

rem * Merge all files into "bundled" packages (to be used in demo pages).

echo /** > %BUILDTARGET2%
echo  * jQuery-USOS *JS BUNDLED VERSION* -- this file includes all jQuery-USOS JS dependencies! >> %BUILDTARGET2%
echo  * Produced out of respect for the authors of http://rawgithub.com/ and used in demos ONLY. >> %BUILDTARGET2%
echo  */ >> %BUILDTARGET2%
echo. >> %BUILDTARGET2%
cat %DEST%/js/jquery-1.9.1.min.js >> %BUILDTARGET2%
cat %DEST%/js/jquery-migrate-1.1.0.min.js >> %BUILDTARGET2%
cat %DEST%/js/jquery-ui-1.10.1.custom.min.js >> %BUILDTARGET2%
cat %DEST%/js/jquery.ba-bbq-1.2.1.min.js >> %BUILDTARGET2%
cat %DEST%/js/jquery.colResizable-1.3.min.js >> %BUILDTARGET2%
cat %DEST%/js/jquery.textext.1.3.1.min.js >> %BUILDTARGET2%
cat %DEST%/js/jquery.tooltipster.2.1.min.js >> %BUILDTARGET2%
