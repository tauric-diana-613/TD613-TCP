import { defineConfig } from "@neon/config/v1";

export default defineConfig({

 auth: true,

 preview: {

   // Upgrade to a paid plan to enable AI Gateway for your project.

   // aiGateway: true,

   buckets: {

     "loom-demo": { access: "public_read" },

   },

   functions: {

     api: { name: "api", source: "./hello.ts" },

     loomcustody: {
       name: "loomcustody",
       source: "./neon/functions/loom-custody/index.mjs",
     },

   },

 },

});
