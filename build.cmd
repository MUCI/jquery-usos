rem * You won't need it unless you're a jQuery-USOS developer, just use
rem * js/jquery.usos-XYZ.min.js file!

rem * This is a simple build script template. I use it to build a new
rem * version from the sources kept in my copy of the USOSweb project.
rem * Currently this works in my own environent only.

set VERSION=0.9.2

set USOSWEB=D:/PRIV/Projekty/usosweb
set DEST=D:/PRIV/Projekty/jquery-usos
set YUICOMPRESSOR=%DEST%/yuicompressor-2.4.2.jar

set BUILDTARGET=%DEST%/js/jquery.usos-%VERSION%.min.js

rm %DEST%/js/jquery.usos*
cp %USOSWEB%/www/js/jquery.usos* %DEST%/js
rm %DEST%/js/jquery.usos-0*
rm %DEST%/js/jquery.usos-1*
rm -R %DEST%/css/jquery.usos
cp -R %USOSWEB%/www/css/jquery.usos %DEST%/css
rm -R %DEST%/css/jquery-ui-theme
cp -R %USOSWEB%/www/css/theme %DEST%/css/jquery-ui-theme
cat %DEST%/js/jquery.usos* > %DEST%/js/tmp1.js
java -jar %YUICOMPRESSOR% --charset utf-8 --type js %DEST%/js/tmp1.js > %DEST%/js/tmp2.js
echo /** jQuery-USOS %VERSION% -- https://github.com/MUCI/jquery-usos */ > %DEST%/js/tmp3.js
cat %DEST%/js/tmp2.js >> %DEST%/js/tmp3.js
mv %DEST%/js/tmp3.js %BUILDTARGET%
rm %DEST%/js/tmp*.js

cp %BUILDTARGET% %USOSWEB%/www/js
