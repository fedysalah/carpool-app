/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["/images/carpool.png","e7186f61fa248b03b6430c152a8b8bc1"],["/images/driver.png","d834d11fd0d0333f795aa26d424d2235"],["/images/icons-trans/android-icon-144x144.png","22cf7f8b9b3171e8bfb9c59b3e900c8e"],["/images/icons-trans/android-icon-192x192.png","422d0be2542f70419e53e1adc4d170c4"],["/images/icons-trans/android-icon-36x36.png","34c10a0bfcae2a1c52dc7db89135da08"],["/images/icons-trans/android-icon-48x48.png","082b7976a8e1ff3e0e738bcf4d657560"],["/images/icons-trans/android-icon-72x72.png","e963831243ed079a1b1c0b8a939da291"],["/images/icons-trans/android-icon-96x96.png","5bd8dc552feac5dc7d9627a5bc8b926a"],["/images/icons-trans/apple-icon-114x114.png","0071242ce773c824819343a892811408"],["/images/icons-trans/apple-icon-120x120.png","7cefa3fc029f64fd1e8d6f7f93963d74"],["/images/icons-trans/apple-icon-144x144.png","22cf7f8b9b3171e8bfb9c59b3e900c8e"],["/images/icons-trans/apple-icon-152x152.png","b61e0be8d770513d94efed5f62d263ab"],["/images/icons-trans/apple-icon-180x180.png","66d41a6703f32e6a679002bc76303fac"],["/images/icons-trans/apple-icon-57x57.png","da4f517ec30f5f715b8c0b40c25be2b8"],["/images/icons-trans/apple-icon-60x60.png","9f5aa6a10275fdb268537846a1043190"],["/images/icons-trans/apple-icon-72x72.png","e963831243ed079a1b1c0b8a939da291"],["/images/icons-trans/apple-icon-76x76.png","422e4b68cca3c3c0207dc0e18e40b034"],["/images/icons-trans/apple-icon-precomposed.png","fc9c3c24c2d175c1419f664e4300d103"],["/images/icons-trans/apple-icon.png","fc9c3c24c2d175c1419f664e4300d103"],["/images/icons-trans/browserconfig.xml","653d077300a12f09a69caeea7a8947f8"],["/images/icons-trans/favicon-16x16.png","f10ce1d826e5ce4103aed3b071e5015d"],["/images/icons-trans/favicon-32x32.png","dada42ffff6170d5ceb5f8e3cdc4b338"],["/images/icons-trans/favicon-96x96.png","5bd8dc552feac5dc7d9627a5bc8b926a"],["/images/icons-trans/favicon.ico","edc0339874eb13806cff474d0a83f77b"],["/images/icons-trans/ms-icon-144x144.png","22cf7f8b9b3171e8bfb9c59b3e900c8e"],["/images/icons-trans/ms-icon-150x150.png","8ad7045000242bf169f1b5e0357425fa"],["/images/icons-trans/ms-icon-310x310.png","097d86e321258469b579fb700f184ecf"],["/images/icons-trans/ms-icon-70x70.png","4b3d5200f19a4453c36612c818f51164"],["/images/icons/android-icon-144x144.png","d1fb9343af3f740eef59e65426eb50cc"],["/images/icons/android-icon-192x192.png","7c40bb0dacc97ef64493beb1eca69f72"],["/images/icons/android-icon-36x36.png","912e510040bbbd4a997ba03b84187a2c"],["/images/icons/android-icon-48x48.png","a93c80af1e9115c2e1b4ada8959a25c4"],["/images/icons/android-icon-72x72.png","e1bfdb9cdd2bb839fdfd5799aba1340a"],["/images/icons/android-icon-96x96.png","eb545f2f100282c2924ae12862dcef3b"],["/images/icons/apple-icon-114x114.png","08f24d378c19333095ec74761d0ab246"],["/images/icons/apple-icon-120x120.png","83ae0dce407aaf503e6cceafbeae5701"],["/images/icons/apple-icon-144x144.png","d1fb9343af3f740eef59e65426eb50cc"],["/images/icons/apple-icon-152x152.png","69a27b6e53f8bb1d66326378ab013cd8"],["/images/icons/apple-icon-180x180.png","5a054cd5c91afa28ff0a1094b14afbd7"],["/images/icons/apple-icon-57x57.png","76e35d58a176cd9fc0f989b13dc2c89b"],["/images/icons/apple-icon-60x60.png","76449b9ad32b05012ef1854a77813d52"],["/images/icons/apple-icon-72x72.png","e1bfdb9cdd2bb839fdfd5799aba1340a"],["/images/icons/apple-icon-76x76.png","8070084bc933ff88c1bfa0f390a9542d"],["/images/icons/apple-icon-precomposed.png","3211cfabb1a89d7d3ff984f515cf6d3f"],["/images/icons/apple-icon.png","3211cfabb1a89d7d3ff984f515cf6d3f"],["/images/icons/browserconfig.xml","653d077300a12f09a69caeea7a8947f8"],["/images/icons/favicon-16x16.png","83fdb082d71b05d646bc342b076a4bce"],["/images/icons/favicon-32x32.png","1e3a3aa7d3609d976aca92d748b08771"],["/images/icons/favicon-96x96.png","eb545f2f100282c2924ae12862dcef3b"],["/images/icons/favicon.ico","9fa28e31eefbd5328507a38f79961e98"],["/images/icons/ms-icon-144x144.png","d1fb9343af3f740eef59e65426eb50cc"],["/images/icons/ms-icon-150x150.png","82a017767379580ff334b43c91d3a888"],["/images/icons/ms-icon-310x310.png","cefb55c2b054fa414f854fd76dc5d49e"],["/images/icons/ms-icon-512x512.png","8882aa656fe65e815c6b7a16f606a74a"],["/images/icons/ms-icon-70x70.png","7fdfaadcd2877e513058550efe32eced"],["/images/pooler.png","080c0d776c96c79e063c5c9f9512ce5e"],["/images/solo.png","0db6f8a4d41701934a9fd0f2b7a15e37"],["/index.html","1586001b91e10946924dba008086dec8"],["/javascripts/bundle/carpool.js","3a4f3e67b26dd5ffc8fce608203e4649"],["/ratchet/css/ratchet-theme-android.css","489f7c05d60c487a1d9e926e472f98da"],["/ratchet/css/ratchet-theme-android.min.css","f20ef9293c6dc4a25cf38e731c9fa96c"],["/ratchet/css/ratchet-theme-ios.css","55eaa976fe01ad39514268069d5a2b22"],["/ratchet/css/ratchet-theme-ios.min.css","71a765d0bf8b36653c4a2f428e3a891e"],["/ratchet/css/ratchet.css","35e5e289f90e5a77af3dd5768438f078"],["/ratchet/css/ratchet.min.css","bceea957c47ebf5246988335b15fa4dc"],["/ratchet/fonts/ratchicons.eot","ea4a08a9d13eac796eb335310c8084f0"],["/ratchet/fonts/ratchicons.svg","70e013de33c2337bce7d5e97eae856b2"],["/ratchet/fonts/ratchicons.ttf","5f48561abb43ace3f2a761ee719f0113"],["/ratchet/fonts/ratchicons.woff","03b48d7ac06a62c5ad76a798683ba177"],["/ratchet/js/ratchet.js","6122342f8ec304abf464c98802e3092b"],["/ratchet/js/ratchet.min.js","7152408fa0b861d6413f94a4afd5477d"]];
var cacheName = 'sw-precache-v3-the-magic-cache-' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function (originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
      return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
      Promise.resolve(originalResponse.body) :
      originalResponse.blob();

    return bodyPromise.then(function(body) {
      // new Response() is happy when passed either a stream or a Blob.
      return new Response(body, {
        headers: originalResponse.headers,
        status: originalResponse.status,
        statusText: originalResponse.statusText
      });
    });
  };

var createCacheKey = function (originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, {credentials: 'same-origin'});
              return fetch(request).then(function(response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function(responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {
      
      return self.clients.claim();
      
    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = 'index.html';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = '/';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted(["^(?!\\/__).*"], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});







