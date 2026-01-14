const MOD_NAME = "hide-my-folders";
const FOLDERS_LIST = "hidden-folders-list";
const EDITOR_ROLE = "hidden-folders-editor-role";

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
    game.settings.register(MOD_NAME, EDITOR_ROLE, {
        name: `${MOD_NAME}.settings.min-role`,
        hint: `${MOD_NAME}.settings.min-role-hint`,
        scope: "world",
        config: true,
        default: CONST.USER_ROLES.GAMEMASTER,
        type: Number,
        choices: {
            2: "USER.RoleTrusted",
            3: "USER.RoleAssistant",
            4: "USER.RoleGamemaster",
        },
        onChange: () => {
            void ui.sidebar.render();
        }
    });
});


Hooks.on("renderAbstractSidebarTab", (_app, html) => {
    const elements = html.querySelectorAll('[data-uuid].directory-item');
    elements.forEach(e => {
        const { uuid } = e.dataset;
        if (!getHiddenFolders().includes(uuid)) return;
        if (isAllowedEditor(game.user)) {
            e.classList.add('hide-my-folders-selected-gm')
        }else{
            e.remove();
        }
    });
});

const getHiddenFolders = () => game.settings.get(MOD_NAME, FOLDERS_LIST);
const getEditorRole = () => game.settings.get(MOD_NAME, EDITOR_ROLE);
const isAllowedEditor = (user) => user.role >= getEditorRole()

Hooks.on("getFolderContextOptions", (_app, menuItems) => {
    menuItems.push({
        name: game.i18n.localize(`${MOD_NAME}.add`),
        icon: '<i class="fa-solid fa-eye-slash"></i>',
        condition: li => {
            const folder = li.parentElement;
            const id = folder.dataset.uuid;
            const classes = folder.classList;
            return isAllowedEditor(game.user) && classes.contains('folder') && !getHiddenFolders().includes(id);
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
            return isAllowedEditor(game.user) && classes.contains('folder') && getHiddenFolders().includes(id);
        },
        callback: li => {
            const folder = li.parentElement;
            const id = folder.dataset.uuid;
            game.settings.set(MOD_NAME, FOLDERS_LIST, [...getHiddenFolders().filter(f => f != id)]);
        }
    });
});
