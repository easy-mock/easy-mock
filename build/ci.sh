set -e
echo '{"blackList": { "projects": ["222222222233333333331212"], "ips": ["127.0.0.1"] }}' > ./config/test.json
npm run lint
npm test

# report coverage stats for non-PRs
if [[ -z $CI_PULL_REQUEST ]]; then
  cat ./coverage/lcov.info | ./node_modules/.bin/codecov
fi
