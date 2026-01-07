const MOD_NAME = "HMF";
const FOLDERS_LIST = "Hidden Folders";

Hooks.once('init', async () => {
  game.settings.register(MOD_NAME, FOLDERS_LIST, {
    scope: 'world',
    config: false,
    type: Array,
    default: [],
  });
});


Hooks.on("renderAbstractSidebarTab", (app, html) => {
    const hiddenFolders = game.settings.get(MOD_NAME, FOLDERS_LIST);
    const elements = html.querySelectorAll('.directory-item [data-uuid]');
    const isGm = game.user.isGM;
    elements.forEach(e => {
        const { uuid } = e.dataset;
        if (!hiddenFolders.includes(uuid)) return;
        if (isGm){
            e.classList.add('hide-my-folders-selected-gm')
        }else{
            e.classList.add('hide-my-folders-selected')
        }
    });
});

Hooks.on("getFolderContextOptions", (_app, menuItems) => {
    const hiddenFolders = game.settings.get(MOD_NAME, FOLDERS_LIST);

    menuItems.push({
        name: game.i18n.localize(`${MOD_NAME}.add`),
        icon: '<i class="fas fa-bolt"></i>',
        condition: li => {
            const id = li.dataset.uuid;
            const classes = li.classList;
            return game.user.isGM && classes.contains('folder') && !hiddenFolders.includes(id);
        },
        callback: li => {
            const id = li.dataset.uuid;
            game.settings.set(MOD_NAME, FOLDERS_LIST, [...hiddenFolders, id]);
        }
    });

    menuItems.push({
        name: game.i18n.localize(`${MOD_NAME}.remove`),
        icon: '<i class="fas fa-bolt"></i>',
        condition: li => {
            const id = li.dataset.uuid;
            return game.user.isGM && hiddenFolders.includes(id);
        },
        callback: li => {
            const id = li.dataset.uuid;
            game.settings.set(MOD_NAME, FOLDERS_LIST, [...hiddenFolders.filter(f => f != id)]);
        }
    });
});
