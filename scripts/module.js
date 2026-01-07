const MOD_NAME = "Hide My Folders";
const FOLDERS_LIST = "Hidden Folders";

Hooks.once('init', async function() {

  game.settings.register(MOD_NAME, FOLDERS_LIST, {
    scope: 'world',
    config: false,
    type: Array,
    default: [],
  });
});
Hooks.on("getFolderContextOptions", (_app, menuItems) => {
    const hiddenFolders = game.settings.get(MOD_NAME, FOLDERS_LIST);

    menuItems.push({
        name: "Hide From Players",
        icon: '<i class="fas fa-bolt"></i>',
        condition: li => {
            const id = li.dataset.uuid;
            return game.user.isGM && hiddenFolders.includes(id);
        },
        callback: li => {
            const id = li.dataset.uuid;
            game.settings.set(MOD_NAME, FOLDERS_LIST, [...hiddenFolders, id]);
        }
    });

    menuItems.push({
        name: "Show To Players",
        icon: '<i class="fas fa-bolt"></i>',
        condition: () => {
            const id = li.dataset.uuid;
            return game.user.isGM && !hiddenFolders.includes(id);
        },
        callback: li => {
            const id = li.dataset.uuid;
            game.settings.set(MOD_NAME, FOLDERS_LIST, [...hiddenFolders.filter(f => f != id)]);
        }
    });
});
