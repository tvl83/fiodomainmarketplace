module.exports = {
	node   : {global: true, fs: 'empty'},
	resolve: {
		fallback: {
			"fs"               : false,
			"tls"              : false,
			"net"              : false,
			"path"             : false,
			"zlib"             : false,
			"http"             : false,
			"https"            : false,
			"stream"           : require.resolve('stream-browserify'),
			"crypto"           : false,
			"crypto-browserify": require.resolve('crypto-browserify'),
			"util"             : require.resolve('util')
		}
	}
}
