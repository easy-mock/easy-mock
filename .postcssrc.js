module.exports = {
  plugins: [
    require('postcss-partial-import'),
    require('postcss-url'),
    require('saladcss-bem')({
      defaultNamespace: 'em',
      separators: {
        descendent: '__'
      },
      shortcuts: {
        modifier: 'm',
        descendent: 'd',
        component: 'c'
      }
    }),
    require('precss'),
    require('postcss-utils'),
    require('postcss-cssnext')({
      browsers: ['ie > 8', 'last 2 versions']
    })
  ]
};
