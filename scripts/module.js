const MOD_NAME = "hide-my-folders";
const FOLDERS_LIST = "hidden-folders-list";

Hooks.once('init', async () => {
    game.settings.register(MOD_NAME, FOLDERS_LIST, {
        scope: 'world',
        config: false,
        type: Array,
        default: [],
        onChange: () => {
            void ui.sidebar.render();
        }
    });
});


Hooks.on("renderAbstractSidebarTab", (_app, html) => {
    const elements = html.querySelectorAll('[data-uuid].directory-item');
    const isGm = game.user.isGM;
    elements.forEach(e => {
        const { uuid } = e.dataset;
        if (!getHiddenFolders().includes(uuid)) return;
        if (isGm) {
            e.classList.add('hide-my-folders-selected-gm')
        }else{
            e.remove();
        }
    });
});

const getHiddenFolders = () => game.settings.get(MOD_NAME, FOLDERS_LIST);

Hooks.on("getFolderContextOptions", (_app, menuItems) => {
    menuItems.push({
        name: game.i18n.localize(`${MOD_NAME}.add`),
        icon: '<i class="fa-solid fa-eye-slash"></i>',
        condition: li => {
            const folder = li.parentElement;
            const id = folder.dataset.uuid;
            const classes = folder.classList;
            return game.user.isGM && classes.contains('folder') && !getHiddenFolders().includes(id);
        },
        callback: li => {
            const folder = li.parentElement;
            const id = folder.dataset.uuid;
            game.settings.set(MOD_NAME, FOLDERS_LIST, [...getHiddenFolders(), id]);
        }
    });

    menuItems.push({
        name: game.i18n.localize(`${MOD_NAME}.remove`),
        icon: '<i class="fa-solid fa-eye"></i>',
        condition: li => {
            const folder = li.parentElement;
            const classes = folder.classList;
            const id = folder.dataset.uuid;
            return game.user.isGM && classes.contains('folder') && getHiddenFolders().includes(id);
        },
        callback: li => {
            const folder = li.parentElement;
            const id = folder.dataset.uuid;
            game.settings.set(MOD_NAME, FOLDERS_LIST, [...getHiddenFolders().filter(f => f != id)]);
        }
    });
});
