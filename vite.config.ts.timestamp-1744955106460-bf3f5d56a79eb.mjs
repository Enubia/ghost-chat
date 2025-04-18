// vite.config.ts
import { rmSync } from "node:fs";
import { resolve } from "node:path";
import VueI18nPlugin from "file:///Volumes/projects/ghost-chat/node_modules/.pnpm/@intlify+unplugin-vue-i18n@5.2.0_@vue+compiler-dom@3.5.12_eslint@8.57.0_rollup@4.21.0_t_fdeb3ef50be998a13f4bca9f5d527359/node_modules/@intlify/unplugin-vue-i18n/lib/index.mjs";
import iconify from "file:///Volumes/projects/ghost-chat/node_modules/.pnpm/@tomjs+vite-plugin-iconify@1.2.1_@iconify+json@2.2.266_vite@5.4.10_@types+node@22.4.1_sass@1.75.0_/node_modules/@tomjs/vite-plugin-iconify/dist/index.mjs";
import vue from "file:///Volumes/projects/ghost-chat/node_modules/.pnpm/@vitejs+plugin-vue@5.1.4_vite@5.4.10_@types+node@22.4.1_sass@1.75.0__vue@3.5.12_typescript@5.6.3_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import autoprefixer from "file:///Volumes/projects/ghost-chat/node_modules/.pnpm/autoprefixer@10.4.20_postcss@8.4.47/node_modules/autoprefixer/lib/autoprefixer.js";
import tailwind from "file:///Volumes/projects/ghost-chat/node_modules/.pnpm/tailwindcss@3.4.14/node_modules/tailwindcss/lib/index.js";
import VueRouter from "file:///Volumes/projects/ghost-chat/node_modules/.pnpm/unplugin-vue-router@0.10.8_rollup@4.21.0_vue-router@4.4.5_vue@3.5.12_typescript@5.6.3___vue@3.5.12_typescript@5.6.3_/node_modules/unplugin-vue-router/dist/vite.js";
import { defineConfig } from "file:///Volumes/projects/ghost-chat/node_modules/.pnpm/vite@5.4.10_@types+node@22.4.1_sass@1.75.0/node_modules/vite/dist/node/index.js";
import electron from "file:///Volumes/projects/ghost-chat/node_modules/.pnpm/vite-plugin-electron@0.28.8_vite-plugin-electron-renderer@0.14.6/node_modules/vite-plugin-electron/dist/index.mjs";
import renderer from "file:///Volumes/projects/ghost-chat/node_modules/.pnpm/vite-plugin-electron-renderer@0.14.6/node_modules/vite-plugin-electron-renderer/dist/index.mjs";
var __vite_injected_original_dirname = "/Volumes/projects/ghost-chat";
var vite_config_default = defineConfig(({ command }) => {
  rmSync("out", { recursive: true, force: true });
  const isServe = command === "serve";
  const isBuild = command === "build";
  return {
    build: {
      outDir: "out/dist"
    },
    css: {
      postcss: {
        plugins: [tailwind(), autoprefixer()]
      }
    },
    plugins: [
      VueRouter(),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ["webview"].includes(tag)
          }
        }
      }),
      iconify({
        resources: ["https://unpkg.com/@iconify/json/json"],
        rotate: 3e3,
        local: ["pepicons-print", "fa6-brands", "fa6-solid", "fa6-regular", "svg-spinners"]
      }),
      VueI18nPlugin.vite({
        include: resolve(process.cwd(), "./i18n/locales/**"),
        runtimeOnly: false
      }),
      electron([
        {
          entry: "electron/main/background.ts",
          onstart(options) {
            options.startup();
          },
          vite: {
            resolve: {
              alias: {
                "#shared": resolve(process.cwd(), "shared")
              }
            },
            build: {
              sourcemap: isServe,
              minify: isBuild,
              outDir: "out/dist-electron/main"
            }
          }
        }
      ]),
      // Use Node.js API in the Renderer-process
      renderer()
    ],
    clearScreen: false,
    resolve: {
      alias: {
        "#shared": resolve(__vite_injected_original_dirname, "shared"),
        "#components": resolve(__vite_injected_original_dirname, "src/components"),
        "#lib": resolve(__vite_injected_original_dirname, "src/lib"),
        "#layouts": resolve(__vite_injected_original_dirname, "src/layouts")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9wcm9qZWN0cy9naG9zdC1jaGF0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVm9sdW1lcy9wcm9qZWN0cy9naG9zdC1jaGF0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Wb2x1bWVzL3Byb2plY3RzL2dob3N0LWNoYXQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgdHlwZSB7IFVzZXJDb25maWdGbiB9IGZyb20gJ3ZpdGUnO1xuXG5pbXBvcnQgeyBybVN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdub2RlOnBhdGgnO1xuXG5pbXBvcnQgVnVlSTE4blBsdWdpbiBmcm9tICdAaW50bGlmeS91bnBsdWdpbi12dWUtaTE4bic7XG5pbXBvcnQgaWNvbmlmeSBmcm9tICdAdG9tanMvdml0ZS1wbHVnaW4taWNvbmlmeSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gJ2F1dG9wcmVmaXhlcic7XG5pbXBvcnQgdGFpbHdpbmQgZnJvbSAndGFpbHdpbmRjc3MnO1xuaW1wb3J0IFZ1ZVJvdXRlciBmcm9tICd1bnBsdWdpbi12dWUtcm91dGVyL3ZpdGUnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgZWxlY3Ryb24gZnJvbSAndml0ZS1wbHVnaW4tZWxlY3Ryb24nO1xuaW1wb3J0IHJlbmRlcmVyIGZyb20gJ3ZpdGUtcGx1Z2luLWVsZWN0cm9uLXJlbmRlcmVyJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCgoeyBjb21tYW5kIH0pID0+IHtcbiAgICBybVN5bmMoJ291dCcsIHsgcmVjdXJzaXZlOiB0cnVlLCBmb3JjZTogdHJ1ZSB9KTtcblxuICAgIGNvbnN0IGlzU2VydmUgPSBjb21tYW5kID09PSAnc2VydmUnO1xuICAgIGNvbnN0IGlzQnVpbGQgPSBjb21tYW5kID09PSAnYnVpbGQnO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgIG91dERpcjogJ291dC9kaXN0JyxcbiAgICAgICAgfSxcbiAgICAgICAgY3NzOiB7XG4gICAgICAgICAgICBwb3N0Y3NzOiB7XG4gICAgICAgICAgICAgICAgcGx1Z2luczogW3RhaWx3aW5kKCksIGF1dG9wcmVmaXhlcigpXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICAgIFZ1ZVJvdXRlcigpLFxuXG4gICAgICAgICAgICB2dWUoe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNDdXN0b21FbGVtZW50OiB0YWcgPT4gWyd3ZWJ2aWV3J10uaW5jbHVkZXModGFnKSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSksXG5cbiAgICAgICAgICAgIGljb25pZnkoe1xuICAgICAgICAgICAgICAgIHJlc291cmNlczogWydodHRwczovL3VucGtnLmNvbS9AaWNvbmlmeS9qc29uL2pzb24nXSxcbiAgICAgICAgICAgICAgICByb3RhdGU6IDMwMDAsXG4gICAgICAgICAgICAgICAgbG9jYWw6IFsncGVwaWNvbnMtcHJpbnQnLCAnZmE2LWJyYW5kcycsICdmYTYtc29saWQnLCAnZmE2LXJlZ3VsYXInLCAnc3ZnLXNwaW5uZXJzJ10sXG4gICAgICAgICAgICB9KSxcblxuICAgICAgICAgICAgVnVlSTE4blBsdWdpbi52aXRlKHtcbiAgICAgICAgICAgICAgICBpbmNsdWRlOiByZXNvbHZlKHByb2Nlc3MuY3dkKCksICcuL2kxOG4vbG9jYWxlcy8qKicpLFxuICAgICAgICAgICAgICAgIHJ1bnRpbWVPbmx5OiBmYWxzZSxcbiAgICAgICAgICAgIH0pLFxuXG4gICAgICAgICAgICBlbGVjdHJvbihbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBlbnRyeTogJ2VsZWN0cm9uL21haW4vYmFja2dyb3VuZC50cycsXG4gICAgICAgICAgICAgICAgICAgIG9uc3RhcnQob3B0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5zdGFydHVwKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHZpdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3NoYXJlZCc6IHJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NoYXJlZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VtYXA6IGlzU2VydmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluaWZ5OiBpc0J1aWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dERpcjogJ291dC9kaXN0LWVsZWN0cm9uL21haW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSksXG5cbiAgICAgICAgICAgIC8vIFVzZSBOb2RlLmpzIEFQSSBpbiB0aGUgUmVuZGVyZXItcHJvY2Vzc1xuICAgICAgICAgICAgcmVuZGVyZXIoKSxcbiAgICAgICAgXSxcbiAgICAgICAgY2xlYXJTY3JlZW46IGZhbHNlLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgICAgICcjc2hhcmVkJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzaGFyZWQnKSxcbiAgICAgICAgICAgICAgICAnI2NvbXBvbmVudHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21wb25lbnRzJyksXG4gICAgICAgICAgICAgICAgJyNsaWInOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9saWInKSxcbiAgICAgICAgICAgICAgICAnI2xheW91dHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9sYXlvdXRzJyksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH07XG59KSBhcyBVc2VyQ29uZmlnRm4pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLFNBQVMsY0FBYztBQUN2QixTQUFTLGVBQWU7QUFFeEIsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sU0FBUztBQUNoQixPQUFPLGtCQUFrQjtBQUN6QixPQUFPLGNBQWM7QUFDckIsT0FBTyxlQUFlO0FBQ3RCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sY0FBYztBQUNyQixPQUFPLGNBQWM7QUFickIsSUFBTSxtQ0FBbUM7QUFlekMsSUFBTyxzQkFBUSxhQUFjLENBQUMsRUFBRSxRQUFRLE1BQU07QUFDMUMsU0FBTyxPQUFPLEVBQUUsV0FBVyxNQUFNLE9BQU8sS0FBSyxDQUFDO0FBRTlDLFFBQU0sVUFBVSxZQUFZO0FBQzVCLFFBQU0sVUFBVSxZQUFZO0FBRTVCLFNBQU87QUFBQSxJQUNILE9BQU87QUFBQSxNQUNILFFBQVE7QUFBQSxJQUNaO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDRCxTQUFTO0FBQUEsUUFDTCxTQUFTLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQztBQUFBLE1BQ3hDO0FBQUEsSUFDSjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ0wsVUFBVTtBQUFBLE1BRVYsSUFBSTtBQUFBLFFBQ0EsVUFBVTtBQUFBLFVBQ04saUJBQWlCO0FBQUEsWUFDYixpQkFBaUIsU0FBTyxDQUFDLFNBQVMsRUFBRSxTQUFTLEdBQUc7QUFBQSxVQUNwRDtBQUFBLFFBQ0o7QUFBQSxNQUNKLENBQUM7QUFBQSxNQUVELFFBQVE7QUFBQSxRQUNKLFdBQVcsQ0FBQyxzQ0FBc0M7QUFBQSxRQUNsRCxRQUFRO0FBQUEsUUFDUixPQUFPLENBQUMsa0JBQWtCLGNBQWMsYUFBYSxlQUFlLGNBQWM7QUFBQSxNQUN0RixDQUFDO0FBQUEsTUFFRCxjQUFjLEtBQUs7QUFBQSxRQUNmLFNBQVMsUUFBUSxRQUFRLElBQUksR0FBRyxtQkFBbUI7QUFBQSxRQUNuRCxhQUFhO0FBQUEsTUFDakIsQ0FBQztBQUFBLE1BRUQsU0FBUztBQUFBLFFBQ0w7QUFBQSxVQUNJLE9BQU87QUFBQSxVQUNQLFFBQVEsU0FBUztBQUNiLG9CQUFRLFFBQVE7QUFBQSxVQUNwQjtBQUFBLFVBQ0EsTUFBTTtBQUFBLFlBQ0YsU0FBUztBQUFBLGNBQ0wsT0FBTztBQUFBLGdCQUNILFdBQVcsUUFBUSxRQUFRLElBQUksR0FBRyxRQUFRO0FBQUEsY0FDOUM7QUFBQSxZQUNKO0FBQUEsWUFDQSxPQUFPO0FBQUEsY0FDSCxXQUFXO0FBQUEsY0FDWCxRQUFRO0FBQUEsY0FDUixRQUFRO0FBQUEsWUFDWjtBQUFBLFVBQ0o7QUFBQSxRQUNKO0FBQUEsTUFDSixDQUFDO0FBQUE7QUFBQSxNQUdELFNBQVM7QUFBQSxJQUNiO0FBQUEsSUFDQSxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsTUFDTCxPQUFPO0FBQUEsUUFDSCxXQUFXLFFBQVEsa0NBQVcsUUFBUTtBQUFBLFFBQ3RDLGVBQWUsUUFBUSxrQ0FBVyxnQkFBZ0I7QUFBQSxRQUNsRCxRQUFRLFFBQVEsa0NBQVcsU0FBUztBQUFBLFFBQ3BDLFlBQVksUUFBUSxrQ0FBVyxhQUFhO0FBQUEsTUFDaEQ7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKLENBQWtCOyIsCiAgIm5hbWVzIjogW10KfQo=
