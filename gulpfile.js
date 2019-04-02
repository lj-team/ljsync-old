var gulp = require('gulp');
var chmod = require('gulp-chmod');
var babel = require('gulp-babel');

gulp.task('default', build);

var config = {
  comments: true,
  compact: false,
  plugins: [
    "syntax-async-functions",
    "transform-runtime",
    "transform-regenerator",
    "transform-decorators-legacy",
    "transform-async-to-generator"
  ],
  presets: ['es2015', 'stage-0']
};

function build () {
  gulp.src('src/*.js')
  .pipe(babel(config))
  .pipe(chmod(0o755))
  .pipe(gulp.dest('./build'));
}
