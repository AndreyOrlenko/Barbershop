'use strict';
const gulp        = require('gulp');
const less        = require('gulp-less');//Преобразует less в css
const concat      = require('gulp-concat'); //Объедияет файлы
const debug       = require('gulp-debug'); //Выводит информацию о проделанной работе в консоль
const sourcemaps  = require('gulp-sourcemaps');// карта файла, из чего он состоит. Позволяет видеть в браузере все составляющие файла
const del         = require('del'); // удаление дерикторий
const uglify      = require('gulp-uglify'); // Минимизирует js файлы
const imgMin      = require('gulp-imagemin'); // минификация изображений
const pngquant    = require('imagemin-pngquant'); // минифицирует png
const notify      = require('gulp-notify'); // обработчик ошибок
const merge       = require('merge-stream'); // Сливает несколько потоков в один
const browserSync = require('browser-sync'); // обновляет страницу в браузере
const cssMin      = require('gulp-minify-css'); //  Минимизирует css файлы
const spritesmith = require('gulp.spritesmith'); //Создает png спрайты
const paths       = require('path'); // пути
const replaceUrl  = require('gulp-css-replace-url'); // Замена url путей в css файлах
const svgSprite   = require('gulp-svg-sprite'); // создание svg спрайтов
const combiner    = require('stream-combiner2').obj; // нужен для обработки ошибок в тасках
const filter      = require('gulp-filter'); // Пропускает через себя только определенные файлы
const ignore      = require('gulp-ignore'); // Игнорирует определенные файлы
const rigger      = require('gulp-rigger'); // можно импортировать куски кода при помощи конструкции //= main-footer.html
const rename      = require('gulp-rename'); // изменяет имя файла .pipe(rename('vendor.min.js`))
const cached      = require('gulp-cached'); // пропускает через себя файлы и файлы с одним и тем же именем и содержимым не пропускает
const autoprefix  = require('gulp-autoprefixer'); // добавляет префиксы
const newer       = require('gulp-newer');// сравнивает поступающие файлы с файлами в конечной директории
const If          = require('gulp-if');
/* IF - пропускает файлы через поток в зависимости от тех или иных условий
 может принимать функцию
 if(function(file) {
 return file.extname == '.js';
 }) - пропускает файлы с расширением js
 if с else
 let condition = function (file) {
 // условие
 return true;
 }
 gulp.task('task', function() {
 gulp.src('./src/*.js')
 .pipe(gulpif(condition, uglify(), beautify()))
 .pipe(gulp.dest('./dist/'));
 });
 */
let isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
/*При таком условии будет генирироваться sourcemap,
если нужно создать файл без него, в консоли запускаем ( set NODE_ENV=prodaction )
 и запустить gulp less-css
*/


//--------------------------------------------------------------------------------------------------
// Создаем объект c путями, для уменьшения работы в будущем
let path = {
  build: { //Тут мы укажем куда складывать готовые после сборки файлы
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/img/',
    fonts: 'build/fonts/'
  },
  src: { //Пути откуда брать исходники
    html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
    jsAll: 'src/js/**/*.js',
    jsNotMain: '!src/js/main.js',
    less: 'src/less/main.less',
    lessFolder: 'src/less/',
    lessAll: 'src/**/*.less',
    img: 'src/blocks/**/*.{jpg,png,svg}', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    imgSpritePng: 'src/blocks/sprites/spritrs-icon/png/*.png',
    imgSprite: '!src/blocks/sprites/spritrs-icon/**/*.*',
    imgSpriteSVG: 'src/blocks/sprites/spritrs-icon/svg/*.svg',
    imgSpriteFolder: 'src/blocks/sprites/',
    fonts: 'src/fonts/**/*.*',
    imgFolder: 'src/img/',
    blocks: 'src/blocks',
    blocksImgAll: 'src/blocks/**/*.{jpg,png,svg}',
    css: 'src/css/**/*.css'

  },
  watchSrc: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: 'src/*.html',
    htmlBlocks: 'src/blocks/**/*.html',
    htmlTamplate: 'src/template/**/*.html',
    js: 'src/js/main.js',
    jsAll: 'src/js/**/*.js',
    jsNotMain: '!src/js/main.js',
    jsBlocks: 'src/blocks/**/*.js',
    less: 'src/less/**/*.less',
    lessBlocks: 'src/blocks/**/*.less',
    css: 'src/css/**/*.css',
    img: 'src/blocks/**/*.{jpg,png,svg}',
    imgFolder: 'src/img/**',
    fonts: 'src/fonts/**/*.*'

  },
  watchBuild: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: 'build/*.html',
    js: 'build/js/main.js',
    jsAll: 'build/js/**/*.js',
    jsNotMain: '!build/js/main.js',
    less: 'build/less/**/*.less',
    img: 'build/img/**/*.{jpg,png,svg}',
    imgFolder: 'build/img/**',
    fonts: 'build/fonts/**/*.*',
    css: 'build/css/**/*.css',
    cssMain: 'build/css/main.css',
    cssNotMain: '!build/css/main.css',
    all: 'build/**/*.*'
  },
  clean: './build'
};
//---------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------
// Конфигурация локального сервера
let config = {
  server: {
    baseDir: "./build"
  },
  // tunnel: true, // создает тунель по которому можно демонстрировать сайт заказчику
  host: 'localhost',
  port: 9000,
  logPrefix: "Frontend_Devil"
};


//---------------------------------------------------------------------------------------------------------------
//-------------------------------less-task-------------------------------------------------
gulp.task('less:build', function () {
  return combiner(
      gulp.src(path.src.less),
      debug(),// title - показывает в консоли название указанное в ковычках
      If(isDevelopment, sourcemaps.init()),
      less(),  //сохранение относительных путей relativeUrls: true
      debug({title: 'src'}),
      autoprefix({
        browsers: ['last 16 versions'],
        cascade: false
      }),
      debug({title: 'auto'}),
      If(isDevelopment, sourcemaps.write()),
      If(!isDevelopment, cssMin()), //сжимает css файлы, на prodiction
      replaceUrl({
        prependRelative: '../img/', //изменяет путь для url background в css
      }),
      cached('less'),
      debug({title: 'cached'}),
      gulp.dest(path.build.css),
      debug({title: 'dest'}),
      browserSync.reload({stream: true})
  ).on('error', notify.onError());
});
//-------------------------------less-task-------------------------------------------------


//-------------------------------css-task--------------------------------------------------
//Переносим файлы из папки src/css в папку build/css
gulp.task('css:build', function () {
  return combiner(
      gulp.src(path.src.css),
      If(!isDevelopment, cssMin()), //сжимает css файлы, на prodiction
      cached('css'),
      debug({title: 'cached'}),
      gulp.dest(path.build.css),
      browserSync.reload({stream: true})
  ).on('error', notify.onError());
});

//-------------------------------css-task--------------------------------------------------


//---------------------------js-task--------------------------------------
gulp.task('js:build', function () {
  return combiner(
      gulp.src(path.src.js),
      debug({title: 'src'}),
      If(isDevelopment, sourcemaps.init()),
      rigger(),
      debug({title: 'rigger'}),
      If(isDevelopment, sourcemaps.write()),
      If(!isDevelopment, uglify()), //сжимает js файлы, на prodiction
      cached('js'),
      gulp.dest(path.build.js),
      browserSync.reload({stream: true})//И перезагрузим наш сервер для обновлений
  ).on('error', notify.onError());
});
//---------------------------js-task--------------------------------------


//---------------------------js-trantport-secondary-file-------------------------------
//Переносим все файлы js кроме main.js
gulp.task('jsOther:build', function () {
  return combiner(
      gulp.src([path.src.jsAll, path.src.jsNotMain]),
      If(!isDevelopment, uglify()), //сжимает js файлы, на prodiction
      cached('jsAll'),
      debug({title: 'cached'}),
      gulp.dest(path.build.js),
      browserSync.reload({stream: true})//И перезагрузим наш сервер для обновлений
  ).on('error', notify.onError());
});


//---------------------------js-trantport-secondary-file-------------------------------


//------------------------clean-task---------------------------------------
//Удаление директории prodaction
gulp.task('clean', function () {
  return del(path.clean);
});
//------------------------clean-task---------------------------------------


//--------------------------------html-task--------------------------------------
// Сборка HTML документов с использованием rigger
gulp.task('html:build', function () {
  return combiner(
      gulp.src(path.src.html), //Выберем файлы по нужному пути
      debug({title: 'src'}),
      rigger(), //Прогоним через rigger
      debug({title: 'rigger'}),
      cached('html'), // html - название кэша
      debug({title: 'cached'}),
      gulp.dest(path.build.html),//Выплюнем их в папку build
      browserSync.reload({stream: true}) //И перезагрузим наш сервер для обновлений
  ).on('error', notify.onError());
});
//--------------------------------html-task-----------------------------------------


//-------------------------------fonts-task----------------------------------------
// Перенос шрифтов
gulp.task('fonts:build', function () {
  return gulp.src(path.src.fonts)
      .pipe(cached('fonts'))
      .pipe(gulp.dest(path.build.fonts))
      .pipe(browserSync.reload({stream: true})); //И перезагрузим наш сервер для обновлений
});
//-------------------------------fonts-task------------------------------------------


//-------------------------------img-task------------------------------------------
gulp.task('image:build', function () {
  return gulp.src([path.src.img, path.src.imgSprite])
      .on('data', function (file) {
        let baseName = file.basename;
        file.base = 'D:\\Fun Work\\GULP-template\\src\\blocks';
        file.path = 'D:\\Fun Work\\GULP-template\\src\\blocks\\' + baseName;

        return file.relative;
      })//Выберем наши картинки кроме иконок для спрайтов, меняем пути так, что бы избавиться от лишних папок


      .pipe(cached('image'))
      .pipe(debug({title: 'cached'}))
      .pipe(imgMin({ //Сожмем их
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()],
        interlaced: true
      }))
      .pipe(gulp.dest(path.build.img)) //И бросим в build
      .pipe(browserSync.reload({stream: true}));//И перезагрузим наш сервер для обновлений

});
//-------------------------------img-task------------------------------------------


//----------------------------------png-sprite------------------------------------------
//Создание png спрайта
gulp.task('png:sprite', function () {
  // Создаем спрайт
  let spriteData = gulp.src(path.src.imgSpritePng)
      .pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'spritepng.less',
        padding: 20, //отступы от изображений по умолчанию в пикселях
        imgPath: 'sprite.png', // указывает путь отдельным изображениям до спрайта
        algorithm: 'binary-tree'
      }));

  // Выводим изображение на диск
  let imgStream = spriteData.img
      .pipe(gulp.dest(path.src.imgSpriteFolder));
  // Выводим less на диск
  let cssStream = spriteData.css
      .pipe(gulp.dest(path.src.imgSpriteFolder));

  // Возвращаем слитый поток
  return merge(imgStream, cssStream);
});
//--------------------------------png-sprite--------------------------------------------


//--------------------------------svg-sprite-------------------------------------------
gulp.task('svg:sprite', function () {
  return gulp.src(path.src.imgSpriteSVG)
      .pipe(svgSprite({
        mode: {
          css: {
            dest: '.', // базовая директория
            bust: false, //удлинняющие префиксы
            latout: 'packed', // тип упаковки
            // prefix: '.',

            padding: 15,
            sprite: 'sprite.svg',
            dimensions: true, //параметры ширины внесены в один файл с позицией
            render: {
              less: {
                dest: 'spritesvg.less' // тип выводимого файла с координатами
              }
            }
          }
        },


      }))
      .pipe(gulp.dest(path.src.imgSpriteFolder));
});

//--------------------------------svg-sprite-------------------------------------------


//-------------------------------------serve----------------------------------------------
gulp.task('serve', function () {
  browserSync.init(config);// запускаем локальный сервер с переменной config в которой мы указали все параметры
  //Следит за всеми файлами в src и при удалении, изменении, добавлении перезагружает страницу
  browserSync.watch(['src/**/*.*', 'build/**/*.*']).on('change', browserSync.reload).on('unlink', browserSync.reload).on('error', notify.onError());

});
//--------------------------------------serve------------------------------------------------


//---------------------------------------WATCH----------------------------------------------------------------------------

gulp.task('watch', function () {


//---------------------------------------------LESS-------------------------------
//Следим за less файлами в папке less и blocks
  gulp.watch([path.watchSrc.less, path.watchSrc.lessBlocks, path.watchBuild.cssMain], gulp.series('less:build')).on('error', notify.onError()).on('unlink', function (filepath) {
    let filePathLess = filepath;

    if (filePathLess === 'src\\less\\main.less') {
      delete cached.caches.less[paths.resolve(filePathLess)];
      let pathInBuildLess = 'build\\css\\main.css';
      del.sync(pathInBuildLess);//удаляем main.сss файл в build, если удален main.less в src
    } else {

      if (filePathLess === 'build\\css\\main.css') {
        let MainCssPathSrc = 'src\\less' + filePathLess.substring(9);
        delete cached.caches.less[paths.resolve(MainCssPathSrc)];

      }

    }
    // }).on('change', function (filepath) { //При изменении файла в build, очищает cached и удаляет его
    //   let filePathLess = filepath;
    //   if(filePathLess.substring(0, 9) === 'build\\css'){
    //     let MainCssPathSrc = 'src\\less' + filePathLess.substring(9);
    //     delete cached.caches.css[paths.resolve(MainCssPathSrc)];
    //     del.sync(filePathLess);
    //   }
    //   gulp.series('css:build')
  });
//---------------------------------------------LESS-------------------------------

//---------------------------------------------CSS--------------------------------
  gulp.watch([path.watchSrc.css, path.watchBuild.css, path.watchBuild.cssNotMain], gulp.series('css:build')).on('error', notify.onError()).on('unlink', function (filepath) {
    let filePathCss = filepath;

    if (filePathCss.substring(0, 7) === 'src\\css') {
      delete cached.caches.css[paths.resolve(filePathCss)];
      let pathInBuildCss = 'build\\css' + filePathCss.substring(7);
      del.sync(pathInBuildCss);//удаляем main.сss файл в build, если удален main.less в src
    } else {

      if (filePathCss.substring(0, 9) === 'build\\css') {
        let CssPathSrc = 'src\\css' + filePathCss.substring(9);
        delete cached.caches.css[paths.resolve(CssPathSrc)];

      }

    }
  });

//---------------------------------------------CSS--------------------------------


//---------------------------------------------JS-------------------------------
  //Следим за файлами js в папке js и blocks
  gulp.watch([path.watchSrc.js, path.watchSrc.jsBlocks, path.watchBuild.js], gulp.series('js:build')).on('error', notify.onError()).on('unlink', function (filepath) {
    let filePathJs = filepath;
    if (filePathJs === 'src\\js\\main.js') {
      delete cached.caches.js[paths.resolve(filepath)];
      let pathInBuildjs = 'build\\js\\main.js';
      del.sync(pathInBuildjs);//удаляем main.js файл в build, если он удален в src
    } else {
      if (filePathJs === 'build\\js\\main.js') {
        let MainJsPathSrc = 'src\\js' + filePathJs.substring(8);
        delete cached.caches.js[paths.resolve(MainJsPathSrc)];

      }
    }
    // }).on('change', function (filepath) {//При изменении файла в build, очищает cached и удаляет его
    //   let filePathJS = filepath;
    //   if(filePathJS.substring(0, 8) === 'build\\js'){
    //     let MainJsPathSrc = 'src\\js' + filePathJS.substring(8);
    //     delete cached.caches.js[paths.resolve(MainJsPathSrc)];
    //     del.sync(filePathJS);
    //   }
    //   gulp.series('js:build');
  });

  //Следим за всеми файлами .js кроме main.js как в src так и в build
  gulp.watch([path.watchSrc.jsAll, path.watchSrc.jsNotMain, path.watchBuild.jsAll, path.watchBuild.jsNotMain], gulp.series('jsOther:build')).on('error', notify.onError()).on('unlink', function (filepath) {
    let filePathJs = filepath;
    console.log(filePathJs);
    console.log(filePathJs.substring(0, 6));
    console.log(filePathJs.substring(0, 8));
    if (filePathJs.substring(0, 6) === 'src\\js') {
      delete cached.caches.jsAll[paths.resolve(filepath)];
      let pathInBuildjs = 'build\\js' + filePathJs.substring(6);
      del.sync(pathInBuildjs);
    } else {
      if (filePathJs.substring(0, 8) === 'build\\js') {
        let JsPathSrc = 'src\\js' + filePathJs.substring(8);
        delete cached.caches.jsAll[paths.resolve(JsPathSrc)];
      }
    }

  });
//---------------------------------------------JS-------------------------------


//------------------------------------FONTS---------------------------------------
  gulp.watch([path.watchSrc.fonts, path.watchBuild.fonts], gulp.series('fonts:build')).on('error', notify.onError()).on('unlink', function (filepath) {
    let filePathFont = filepath;
    if (filePathFont.substring(0, 9) === 'src\\fonts') {
      delete cached.caches.fonts[paths.resolve(filepath)];
      let pathInBuildFile = 'build\\fonts' + filePathFont.substring(9);
      //через метод sync, модуля del удаляем файл по выбраннама пути
      del.sync(pathInBuildFile);


    } else {
      if (filePathFont.substring(0, 11) === 'build\\fonts') {   //Проверяем удаленный файл на директорию, если это build код выполнится
        let filePathFont = filepath;
        let clipPathFont = filePathFont.substring(5); // Записывает в переменную все символы с 5-го и до конца
        let dirInSrcFont = 'src' + clipPathFont; // меняет директорию на src
        delete cached.caches.fonts[paths.resolve(dirInSrcFont)]; // удаляем кэш файла в src, тем самым перезапуская сборку


      }


    }


  });
//-------------------------------------FONTS--------------------------------------


//------------------------------------------HTML----------------------------------------
  //Следим за файлами HTML в папке template и в основной директории
// За папкой template, если произошли изменения пересобираем основные файлы
  gulp.watch(path.watchSrc.htmlTamplate, gulp.series('html:build')).on('error', notify.onError()).on('unlink', gulp.series('image:build'));
// За основными файлами, если файл удален, то удаляем его и из build
  gulp.watch([path.watchSrc.html, path.watchBuild.html], gulp.series('html:build')).on('error', notify.onError()).on('unlink', function (filepath) {

    let dirNameDelFile = paths.dirname(filepath);
    if (dirNameDelFile === 'src') {
      delete cached.caches.html[paths.resolve(filepath)]; // При удалении файла, удаляет его по абсолютному пути из кэша html

      let pathInBuildFile = 'build\\' + paths.basename(filepath); // При удалении файла, удаляем его копию в build
      del.sync(pathInBuildFile);

    } else {
      if (dirNameDelFile === 'build') {   //Проверяем удаленный файл на директорию, если это build код выполнится
        let dirInSrcHtml = 'src\\' + paths.basename(filepath); // переписываем build\file.hml в src\file.html
        delete cached.caches.html[paths.resolve(dirInSrcHtml)]; // удаляем кэш файла в src, тем самым перезапуская сборку
      }

      gulp.series('html:build'); // во всех других случаях при удалении файла запускаем таск html:build
    }

    // }).on('change', function (filepath) { //При изменении файла в build, очищает cached и удаляет его
    //   let filePathHtml = filepath;
    //   if(filePathHtml.substring(0, 6) === 'build\\'){
    //     let dirInSrcHtml = 'src\\' + paths.basename(filepath);
    //     delete cached.caches.html[paths.resolve(dirInSrcHtml)];
    //     del.sync(filePathHtml);
    //
    //   }
    //   gulp.series('html:build');
  });
//--------------------------------HTML-------------------------------


//---------------------------------IMAGE----------------------------------------------------
//следим за ИЗОБРАЖЕНИЯМИ
  gulp.watch([path.watchSrc.img, path.watchBuild.img, path.src.imgSprite], gulp.series('image:build')).on('error', notify.onError()).on('unlink', function (filepath) {
    // записываем в переменную ,базовую директорию удаленного файла
    let pathDelFileImg = filepath;
    console.log(pathDelFileImg);
    //Условие выполнитс, если pathDelFile обрезанный на 9 символов не будет равняться build\img (таким образом при удалении файлов в директории build, код выполняться не будет)
    if (pathDelFileImg.substring(0, 10) === 'src\\blocks') {
      let relativeImgPath = 'src\\blocks\\' + paths.basename(filepath);
      delete cached.caches.image[paths.resolve(relativeImgPath)];
      //записываем в переменную пyть до файла в build, \\ - воспроизводятся как один (Подсказка, path в node.js)
      let pathInBuildFile = 'build\\img\\' + paths.basename(filepath);
      //через метод sync, модуля del удаляем файл по выбраннама пути
      del.sync(pathInBuildFile);

    } else {

      if (pathDelFileImg.substring(0, 9) === 'build\\img') {   //Проверяем удаленный файл на директорию, если это build код выполнится
        console.log('Получилось');
        let clipPathImg = paths.basename(filepath); // Записывает в переменную все символы с 5-го и до конца
        console.log(clipPathImg);
        let dirInSrcImg = 'src\\blocks\\' + clipPathImg; // меняет директорию на src
        console.log(dirInSrcImg);
        delete cached.caches.image[paths.resolve(dirInSrcImg)]; // удаляем кэш файла в src, тем самым перезапуская сборку
      }


    }
  });
//--------------------------------------------IMAGE---------------------------------------


});
//---------------------------------------------WATCH--------------------------------------------------------


//-------------------------------------GULP------------------------------------------------------------------
gulp.task('default', gulp.series('clean', 'html:build', 'less:build', 'css:build', 'js:build', 'jsOther:build', 'image:build', 'fonts:build', gulp.parallel('watch', 'serve'))); //паралельно запускает watch и serve
