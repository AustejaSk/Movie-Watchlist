import {defineConfig} from 'vite'


export default defineConfig({
	plugins: []	
})

export default {
	build: {
	  rollupOptions: {
		external: ['firebase/app']
	  }
	}
  }