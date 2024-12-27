/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/node-gyp-build";
exports.ids = ["vendor-chunks/node-gyp-build"];
exports.modules = {

/***/ "(ssr)/../node_modules/node-gyp-build/index.js":
/*!***********************************************!*\
  !*** ../node_modules/node-gyp-build/index.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var fs = __webpack_require__(/*! fs */ \"fs\")\nvar path = __webpack_require__(/*! path */ \"path\")\nvar os = __webpack_require__(/*! os */ \"os\")\n\n// Workaround to fix webpack's build warnings: 'the request of a dependency is an expression'\nvar runtimeRequire =  true ? require : 0 // eslint-disable-line\n\nvar vars = (process.config && process.config.variables) || {}\nvar prebuildsOnly = !!process.env.PREBUILDS_ONLY\nvar abi = process.versions.modules // TODO: support old node where this is undef\nvar runtime = isElectron() ? 'electron' : 'node'\nvar arch = os.arch()\nvar platform = os.platform()\nvar libc = process.env.LIBC || (isAlpine(platform) ? 'musl' : 'glibc')\nvar armv = process.env.ARM_VERSION || (arch === 'arm64' ? '8' : vars.arm_version) || ''\nvar uv = (process.versions.uv || '').split('.')[0]\n\nmodule.exports = load\n\nfunction load (dir) {\n  return runtimeRequire(load.path(dir))\n}\n\nload.path = function (dir) {\n  dir = path.resolve(dir || '.')\n\n  try {\n    var name = runtimeRequire(path.join(dir, 'package.json')).name.toUpperCase().replace(/-/g, '_')\n    if (process.env[name + '_PREBUILD']) dir = process.env[name + '_PREBUILD']\n  } catch (err) {}\n\n  if (!prebuildsOnly) {\n    var release = getFirst(path.join(dir, 'build/Release'), matchBuild)\n    if (release) return release\n\n    var debug = getFirst(path.join(dir, 'build/Debug'), matchBuild)\n    if (debug) return debug\n  }\n\n  var prebuild = resolve(dir)\n  if (prebuild) return prebuild\n\n  var nearby = resolve(path.dirname(process.execPath))\n  if (nearby) return nearby\n\n  var target = [\n    'platform=' + platform,\n    'arch=' + arch,\n    'runtime=' + runtime,\n    'abi=' + abi,\n    'uv=' + uv,\n    armv ? 'armv=' + armv : '',\n    'libc=' + libc,\n    'node=' + process.versions.node,\n    (process.versions && process.versions.electron) ? 'electron=' + process.versions.electron : '',\n     true ? 'webpack=true' : 0 // eslint-disable-line\n  ].filter(Boolean).join(' ')\n\n  throw new Error('No native build was found for ' + target + '\\n    loaded from: ' + dir + '\\n')\n\n  function resolve (dir) {\n    // Find most specific flavor first\n    var prebuilds = path.join(dir, 'prebuilds', platform + '-' + arch)\n    var parsed = readdirSync(prebuilds).map(parseTags)\n    var candidates = parsed.filter(matchTags(runtime, abi))\n    var winner = candidates.sort(compareTags(runtime))[0]\n    if (winner) return path.join(prebuilds, winner.file)\n  }\n}\n\nfunction readdirSync (dir) {\n  try {\n    return fs.readdirSync(dir)\n  } catch (err) {\n    return []\n  }\n}\n\nfunction getFirst (dir, filter) {\n  var files = readdirSync(dir).filter(filter)\n  return files[0] && path.join(dir, files[0])\n}\n\nfunction matchBuild (name) {\n  return /\\.node$/.test(name)\n}\n\nfunction parseTags (file) {\n  var arr = file.split('.')\n  var extension = arr.pop()\n  var tags = { file: file, specificity: 0 }\n\n  if (extension !== 'node') return\n\n  for (var i = 0; i < arr.length; i++) {\n    var tag = arr[i]\n\n    if (tag === 'node' || tag === 'electron' || tag === 'node-webkit') {\n      tags.runtime = tag\n    } else if (tag === 'napi') {\n      tags.napi = true\n    } else if (tag.slice(0, 3) === 'abi') {\n      tags.abi = tag.slice(3)\n    } else if (tag.slice(0, 2) === 'uv') {\n      tags.uv = tag.slice(2)\n    } else if (tag.slice(0, 4) === 'armv') {\n      tags.armv = tag.slice(4)\n    } else if (tag === 'glibc' || tag === 'musl') {\n      tags.libc = tag\n    } else {\n      continue\n    }\n\n    tags.specificity++\n  }\n\n  return tags\n}\n\nfunction matchTags (runtime, abi) {\n  return function (tags) {\n    if (tags == null) return false\n    if (tags.runtime !== runtime && !runtimeAgnostic(tags)) return false\n    if (tags.abi !== abi && !tags.napi) return false\n    if (tags.uv && tags.uv !== uv) return false\n    if (tags.armv && tags.armv !== armv) return false\n    if (tags.libc && tags.libc !== libc) return false\n\n    return true\n  }\n}\n\nfunction runtimeAgnostic (tags) {\n  return tags.runtime === 'node' && tags.napi\n}\n\nfunction compareTags (runtime) {\n  // Precedence: non-agnostic runtime, abi over napi, then by specificity.\n  return function (a, b) {\n    if (a.runtime !== b.runtime) {\n      return a.runtime === runtime ? -1 : 1\n    } else if (a.abi !== b.abi) {\n      return a.abi ? -1 : 1\n    } else if (a.specificity !== b.specificity) {\n      return a.specificity > b.specificity ? -1 : 1\n    } else {\n      return 0\n    }\n  }\n}\n\nfunction isElectron () {\n  if (process.versions && process.versions.electron) return true\n  if (process.env.ELECTRON_RUN_AS_NODE) return true\n  return typeof window !== 'undefined' && window.process && window.process.type === 'renderer'\n}\n\nfunction isAlpine (platform) {\n  return platform === 'linux' && fs.existsSync('/etc/alpine-release')\n}\n\n// Exposed for unit tests\n// TODO: move to lib\nload.parseTags = parseTags\nload.matchTags = matchTags\nload.compareTags = compareTags\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vbm9kZV9tb2R1bGVzL25vZGUtZ3lwLWJ1aWxkL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFBLFNBQVMsbUJBQU8sQ0FBQyxjQUFJO0FBQ3JCLFdBQVcsbUJBQU8sQ0FBQyxrQkFBTTtBQUN6QixTQUFTLG1CQUFPLENBQUMsY0FBSTs7QUFFckI7QUFDQSxxQkFBcUIsS0FBeUMsR0FBRyxPQUF1QixHQUFHLENBQU87O0FBRWxHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxLQUF5QyxvQkFBb0IsQ0FBRTtBQUNuRTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZUFBZTs7QUFFZjs7QUFFQSxrQkFBa0IsZ0JBQWdCO0FBQ2xDOztBQUVBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsiRDpcXC5kZXZcXERMVFxccG9zdGVyLWNvbnRyYWN0XFxub2RlX21vZHVsZXNcXG5vZGUtZ3lwLWJ1aWxkXFxpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZnMgPSByZXF1aXJlKCdmcycpXG52YXIgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxudmFyIG9zID0gcmVxdWlyZSgnb3MnKVxuXG4vLyBXb3JrYXJvdW5kIHRvIGZpeCB3ZWJwYWNrJ3MgYnVpbGQgd2FybmluZ3M6ICd0aGUgcmVxdWVzdCBvZiBhIGRlcGVuZGVuY3kgaXMgYW4gZXhwcmVzc2lvbidcbnZhciBydW50aW1lUmVxdWlyZSA9IHR5cGVvZiBfX3dlYnBhY2tfcmVxdWlyZV9fID09PSAnZnVuY3Rpb24nID8gX19ub25fd2VicGFja19yZXF1aXJlX18gOiByZXF1aXJlIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxudmFyIHZhcnMgPSAocHJvY2Vzcy5jb25maWcgJiYgcHJvY2Vzcy5jb25maWcudmFyaWFibGVzKSB8fCB7fVxudmFyIHByZWJ1aWxkc09ubHkgPSAhIXByb2Nlc3MuZW52LlBSRUJVSUxEU19PTkxZXG52YXIgYWJpID0gcHJvY2Vzcy52ZXJzaW9ucy5tb2R1bGVzIC8vIFRPRE86IHN1cHBvcnQgb2xkIG5vZGUgd2hlcmUgdGhpcyBpcyB1bmRlZlxudmFyIHJ1bnRpbWUgPSBpc0VsZWN0cm9uKCkgPyAnZWxlY3Ryb24nIDogJ25vZGUnXG52YXIgYXJjaCA9IG9zLmFyY2goKVxudmFyIHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKVxudmFyIGxpYmMgPSBwcm9jZXNzLmVudi5MSUJDIHx8IChpc0FscGluZShwbGF0Zm9ybSkgPyAnbXVzbCcgOiAnZ2xpYmMnKVxudmFyIGFybXYgPSBwcm9jZXNzLmVudi5BUk1fVkVSU0lPTiB8fCAoYXJjaCA9PT0gJ2FybTY0JyA/ICc4JyA6IHZhcnMuYXJtX3ZlcnNpb24pIHx8ICcnXG52YXIgdXYgPSAocHJvY2Vzcy52ZXJzaW9ucy51diB8fCAnJykuc3BsaXQoJy4nKVswXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxvYWRcblxuZnVuY3Rpb24gbG9hZCAoZGlyKSB7XG4gIHJldHVybiBydW50aW1lUmVxdWlyZShsb2FkLnBhdGgoZGlyKSlcbn1cblxubG9hZC5wYXRoID0gZnVuY3Rpb24gKGRpcikge1xuICBkaXIgPSBwYXRoLnJlc29sdmUoZGlyIHx8ICcuJylcblxuICB0cnkge1xuICAgIHZhciBuYW1lID0gcnVudGltZVJlcXVpcmUocGF0aC5qb2luKGRpciwgJ3BhY2thZ2UuanNvbicpKS5uYW1lLnRvVXBwZXJDYXNlKCkucmVwbGFjZSgvLS9nLCAnXycpXG4gICAgaWYgKHByb2Nlc3MuZW52W25hbWUgKyAnX1BSRUJVSUxEJ10pIGRpciA9IHByb2Nlc3MuZW52W25hbWUgKyAnX1BSRUJVSUxEJ11cbiAgfSBjYXRjaCAoZXJyKSB7fVxuXG4gIGlmICghcHJlYnVpbGRzT25seSkge1xuICAgIHZhciByZWxlYXNlID0gZ2V0Rmlyc3QocGF0aC5qb2luKGRpciwgJ2J1aWxkL1JlbGVhc2UnKSwgbWF0Y2hCdWlsZClcbiAgICBpZiAocmVsZWFzZSkgcmV0dXJuIHJlbGVhc2VcblxuICAgIHZhciBkZWJ1ZyA9IGdldEZpcnN0KHBhdGguam9pbihkaXIsICdidWlsZC9EZWJ1ZycpLCBtYXRjaEJ1aWxkKVxuICAgIGlmIChkZWJ1ZykgcmV0dXJuIGRlYnVnXG4gIH1cblxuICB2YXIgcHJlYnVpbGQgPSByZXNvbHZlKGRpcilcbiAgaWYgKHByZWJ1aWxkKSByZXR1cm4gcHJlYnVpbGRcblxuICB2YXIgbmVhcmJ5ID0gcmVzb2x2ZShwYXRoLmRpcm5hbWUocHJvY2Vzcy5leGVjUGF0aCkpXG4gIGlmIChuZWFyYnkpIHJldHVybiBuZWFyYnlcblxuICB2YXIgdGFyZ2V0ID0gW1xuICAgICdwbGF0Zm9ybT0nICsgcGxhdGZvcm0sXG4gICAgJ2FyY2g9JyArIGFyY2gsXG4gICAgJ3J1bnRpbWU9JyArIHJ1bnRpbWUsXG4gICAgJ2FiaT0nICsgYWJpLFxuICAgICd1dj0nICsgdXYsXG4gICAgYXJtdiA/ICdhcm12PScgKyBhcm12IDogJycsXG4gICAgJ2xpYmM9JyArIGxpYmMsXG4gICAgJ25vZGU9JyArIHByb2Nlc3MudmVyc2lvbnMubm9kZSxcbiAgICAocHJvY2Vzcy52ZXJzaW9ucyAmJiBwcm9jZXNzLnZlcnNpb25zLmVsZWN0cm9uKSA/ICdlbGVjdHJvbj0nICsgcHJvY2Vzcy52ZXJzaW9ucy5lbGVjdHJvbiA6ICcnLFxuICAgIHR5cGVvZiBfX3dlYnBhY2tfcmVxdWlyZV9fID09PSAnZnVuY3Rpb24nID8gJ3dlYnBhY2s9dHJ1ZScgOiAnJyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJyAnKVxuXG4gIHRocm93IG5ldyBFcnJvcignTm8gbmF0aXZlIGJ1aWxkIHdhcyBmb3VuZCBmb3IgJyArIHRhcmdldCArICdcXG4gICAgbG9hZGVkIGZyb206ICcgKyBkaXIgKyAnXFxuJylcblxuICBmdW5jdGlvbiByZXNvbHZlIChkaXIpIHtcbiAgICAvLyBGaW5kIG1vc3Qgc3BlY2lmaWMgZmxhdm9yIGZpcnN0XG4gICAgdmFyIHByZWJ1aWxkcyA9IHBhdGguam9pbihkaXIsICdwcmVidWlsZHMnLCBwbGF0Zm9ybSArICctJyArIGFyY2gpXG4gICAgdmFyIHBhcnNlZCA9IHJlYWRkaXJTeW5jKHByZWJ1aWxkcykubWFwKHBhcnNlVGFncylcbiAgICB2YXIgY2FuZGlkYXRlcyA9IHBhcnNlZC5maWx0ZXIobWF0Y2hUYWdzKHJ1bnRpbWUsIGFiaSkpXG4gICAgdmFyIHdpbm5lciA9IGNhbmRpZGF0ZXMuc29ydChjb21wYXJlVGFncyhydW50aW1lKSlbMF1cbiAgICBpZiAod2lubmVyKSByZXR1cm4gcGF0aC5qb2luKHByZWJ1aWxkcywgd2lubmVyLmZpbGUpXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVhZGRpclN5bmMgKGRpcikge1xuICB0cnkge1xuICAgIHJldHVybiBmcy5yZWFkZGlyU3luYyhkaXIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBbXVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldEZpcnN0IChkaXIsIGZpbHRlcikge1xuICB2YXIgZmlsZXMgPSByZWFkZGlyU3luYyhkaXIpLmZpbHRlcihmaWx0ZXIpXG4gIHJldHVybiBmaWxlc1swXSAmJiBwYXRoLmpvaW4oZGlyLCBmaWxlc1swXSlcbn1cblxuZnVuY3Rpb24gbWF0Y2hCdWlsZCAobmFtZSkge1xuICByZXR1cm4gL1xcLm5vZGUkLy50ZXN0KG5hbWUpXG59XG5cbmZ1bmN0aW9uIHBhcnNlVGFncyAoZmlsZSkge1xuICB2YXIgYXJyID0gZmlsZS5zcGxpdCgnLicpXG4gIHZhciBleHRlbnNpb24gPSBhcnIucG9wKClcbiAgdmFyIHRhZ3MgPSB7IGZpbGU6IGZpbGUsIHNwZWNpZmljaXR5OiAwIH1cblxuICBpZiAoZXh0ZW5zaW9uICE9PSAnbm9kZScpIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHRhZyA9IGFycltpXVxuXG4gICAgaWYgKHRhZyA9PT0gJ25vZGUnIHx8IHRhZyA9PT0gJ2VsZWN0cm9uJyB8fCB0YWcgPT09ICdub2RlLXdlYmtpdCcpIHtcbiAgICAgIHRhZ3MucnVudGltZSA9IHRhZ1xuICAgIH0gZWxzZSBpZiAodGFnID09PSAnbmFwaScpIHtcbiAgICAgIHRhZ3MubmFwaSA9IHRydWVcbiAgICB9IGVsc2UgaWYgKHRhZy5zbGljZSgwLCAzKSA9PT0gJ2FiaScpIHtcbiAgICAgIHRhZ3MuYWJpID0gdGFnLnNsaWNlKDMpXG4gICAgfSBlbHNlIGlmICh0YWcuc2xpY2UoMCwgMikgPT09ICd1dicpIHtcbiAgICAgIHRhZ3MudXYgPSB0YWcuc2xpY2UoMilcbiAgICB9IGVsc2UgaWYgKHRhZy5zbGljZSgwLCA0KSA9PT0gJ2FybXYnKSB7XG4gICAgICB0YWdzLmFybXYgPSB0YWcuc2xpY2UoNClcbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ2dsaWJjJyB8fCB0YWcgPT09ICdtdXNsJykge1xuICAgICAgdGFncy5saWJjID0gdGFnXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgdGFncy5zcGVjaWZpY2l0eSsrXG4gIH1cblxuICByZXR1cm4gdGFnc1xufVxuXG5mdW5jdGlvbiBtYXRjaFRhZ3MgKHJ1bnRpbWUsIGFiaSkge1xuICByZXR1cm4gZnVuY3Rpb24gKHRhZ3MpIHtcbiAgICBpZiAodGFncyA9PSBudWxsKSByZXR1cm4gZmFsc2VcbiAgICBpZiAodGFncy5ydW50aW1lICE9PSBydW50aW1lICYmICFydW50aW1lQWdub3N0aWModGFncykpIHJldHVybiBmYWxzZVxuICAgIGlmICh0YWdzLmFiaSAhPT0gYWJpICYmICF0YWdzLm5hcGkpIHJldHVybiBmYWxzZVxuICAgIGlmICh0YWdzLnV2ICYmIHRhZ3MudXYgIT09IHV2KSByZXR1cm4gZmFsc2VcbiAgICBpZiAodGFncy5hcm12ICYmIHRhZ3MuYXJtdiAhPT0gYXJtdikgcmV0dXJuIGZhbHNlXG4gICAgaWYgKHRhZ3MubGliYyAmJiB0YWdzLmxpYmMgIT09IGxpYmMpIHJldHVybiBmYWxzZVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuXG5mdW5jdGlvbiBydW50aW1lQWdub3N0aWMgKHRhZ3MpIHtcbiAgcmV0dXJuIHRhZ3MucnVudGltZSA9PT0gJ25vZGUnICYmIHRhZ3MubmFwaVxufVxuXG5mdW5jdGlvbiBjb21wYXJlVGFncyAocnVudGltZSkge1xuICAvLyBQcmVjZWRlbmNlOiBub24tYWdub3N0aWMgcnVudGltZSwgYWJpIG92ZXIgbmFwaSwgdGhlbiBieSBzcGVjaWZpY2l0eS5cbiAgcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgaWYgKGEucnVudGltZSAhPT0gYi5ydW50aW1lKSB7XG4gICAgICByZXR1cm4gYS5ydW50aW1lID09PSBydW50aW1lID8gLTEgOiAxXG4gICAgfSBlbHNlIGlmIChhLmFiaSAhPT0gYi5hYmkpIHtcbiAgICAgIHJldHVybiBhLmFiaSA/IC0xIDogMVxuICAgIH0gZWxzZSBpZiAoYS5zcGVjaWZpY2l0eSAhPT0gYi5zcGVjaWZpY2l0eSkge1xuICAgICAgcmV0dXJuIGEuc3BlY2lmaWNpdHkgPiBiLnNwZWNpZmljaXR5ID8gLTEgOiAxXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAwXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzRWxlY3Ryb24gKCkge1xuICBpZiAocHJvY2Vzcy52ZXJzaW9ucyAmJiBwcm9jZXNzLnZlcnNpb25zLmVsZWN0cm9uKSByZXR1cm4gdHJ1ZVxuICBpZiAocHJvY2Vzcy5lbnYuRUxFQ1RST05fUlVOX0FTX05PREUpIHJldHVybiB0cnVlXG4gIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucHJvY2VzcyAmJiB3aW5kb3cucHJvY2Vzcy50eXBlID09PSAncmVuZGVyZXInXG59XG5cbmZ1bmN0aW9uIGlzQWxwaW5lIChwbGF0Zm9ybSkge1xuICByZXR1cm4gcGxhdGZvcm0gPT09ICdsaW51eCcgJiYgZnMuZXhpc3RzU3luYygnL2V0Yy9hbHBpbmUtcmVsZWFzZScpXG59XG5cbi8vIEV4cG9zZWQgZm9yIHVuaXQgdGVzdHNcbi8vIFRPRE86IG1vdmUgdG8gbGliXG5sb2FkLnBhcnNlVGFncyA9IHBhcnNlVGFnc1xubG9hZC5tYXRjaFRhZ3MgPSBtYXRjaFRhZ3NcbmxvYWQuY29tcGFyZVRhZ3MgPSBjb21wYXJlVGFnc1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/../node_modules/node-gyp-build/index.js\n");

/***/ })

};
;