set -e
npm run lint
npm run test-cov

# report coverage stats for non-PRs
if [[ -z $CI_PULL_REQUEST ]]; then
  cat ./coverage/lcov.info | ./node_modules/.bin/codecov
fi
