/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Create projects collection
  const projects = new Collection({
    name: "projects",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      { name: "title", type: "text", required: true, options: { max: 255 } },
      { name: "artist", type: "text", required: false, options: { max: 255 } },
      { name: "genre", type: "text", required: false, options: { max: 100 } },
      { name: "bpm", type: "number", required: false, options: { min: 0, max: 300 } },
      { name: "key", type: "text", required: false, options: { max: 50 } },
      { name: "description", type: "text", required: false, options: { max: 5000 } },
      {
        name: "status",
        type: "select",
        required: false,
        options: {
          maxSelect: 1,
          values: ["draft", "in_progress", "mastering", "released"]
        }
      },
      { name: "cover", type: "file", required: false, options: { maxSelect: 1, maxSize: 5242880 } },
      { name: "owner", type: "relation", required: false, options: { maxSelect: 1, collectionId: "_pb_users_auth_" } }
    ]
  });

  app.save(projects);

  // Create audio_files collection
  const audioFiles = new Collection({
    name: "audio_files",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      { name: "project", type: "relation", required: true, options: { maxSelect: 1, collectionId: projects.id } },
      { name: "file", type: "file", required: true, options: { maxSelect: 1, maxSize: 104857600 } },
      { name: "version", type: "text", required: false, options: { max: 50 } },
      {
        name: "file_type",
        type: "select",
        required: false,
        options: {
          maxSelect: 1,
          values: ["master", "stem_vocals", "stem_instrumental", "raw", "mix"]
        }
      },
      { name: "notes", type: "text", required: false, options: { max: 2000 } },
      { name: "owner", type: "relation", required: false, options: { maxSelect: 1, collectionId: "_pb_users_auth_" } }
    ]
  });

  app.save(audioFiles);

  // Create prompts collection
  const prompts = new Collection({
    name: "prompts",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      { name: "project", type: "relation", required: true, options: { maxSelect: 1, collectionId: projects.id } },
      { name: "prompt_text", type: "text", required: true, options: { max: 10000 } },
      {
        name: "ai_service",
        type: "select",
        required: false,
        options: {
          maxSelect: 1,
          values: ["Suno", "Udio", "AIVA", "Boomy", "Soundraw", "Other"]
        }
      },
      { name: "tags", type: "text", required: false, options: { max: 500 } },
      { name: "owner", type: "relation", required: false, options: { maxSelect: 1, collectionId: "_pb_users_auth_" } }
    ]
  });

  app.save(prompts);

  // Create lyrics collection
  const lyrics = new Collection({
    name: "lyrics",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      { name: "project", type: "relation", required: true, options: { maxSelect: 1, collectionId: projects.id } },
      { name: "content", type: "text", required: true, options: { max: 50000 } },
      { name: "language", type: "text", required: false, options: { max: 10 } },
      { name: "owner", type: "relation", required: false, options: { maxSelect: 1, collectionId: "_pb_users_auth_" } }
    ]
  });

  app.save(lyrics);

  // Create visual_assets collection
  const visualAssets = new Collection({
    name: "visual_assets",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    fields: [
      { name: "project", type: "relation", required: true, options: { maxSelect: 1, collectionId: projects.id } },
      { name: "file", type: "file", required: true, options: { maxSelect: 1, maxSize: 52428800 } },
      {
        name: "asset_type",
        type: "select",
        required: false,
        options: {
          maxSelect: 1,
          values: ["cover", "thumbnail", "background", "video_loop", "promo"]
        }
      },
      {
        name: "format",
        type: "select",
        required: false,
        options: {
          maxSelect: 1,
          values: ["1:1", "16:9", "9:16", "4:3", "other"]
        }
      },
      { name: "alt_text", type: "text", required: false, options: { max: 500 } },
      { name: "owner", type: "relation", required: false, options: { maxSelect: 1, collectionId: "_pb_users_auth_" } }
    ]
  });

  app.save(visualAssets);
}, (app) => {
  // Revert: delete all created collections
  const collectionNames = ["visual_assets", "lyrics", "prompts", "audio_files", "projects"];
  for (const name of collectionNames) {
    try {
      const collection = app.findCollectionByNameOrId(name);
      if (collection) {
        app.delete(collection);
      }
    } catch (e) {
      // Collection may not exist, that's fine
    }
  }
})