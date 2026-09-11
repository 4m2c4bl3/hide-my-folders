/**
 * @typedef {{ role: number }} User
 * @typedef {HTMLElement & { dataset: DOMStringMap }} FolderElement
 */

const MOD_NAME = "hide-my-folders";
const FOLDERS_LIST = "hidden-folders-list";
const EDITOR_ROLE = "hidden-folders-editor-role";
/** @returns {any} */
const getSettings = () => game.settings;

Hooks.once('init', async () => {
    getSettings().register(MOD_NAME, FOLDERS_LIST, {
        scope: 'world',
        config: false,
        type: Array,
        default: [],
        onChange: () => {
            void ui.sidebar?.render();
        }
    });
    getSettings().register(MOD_NAME, EDITOR_ROLE, {
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
            void ui.sidebar?.render();
        }
    });
});


Hooks.on("renderAbstractSidebarTab", (_app, html) => {
    const elements = html.querySelectorAll('.directory-item.folder[data-uuid]');
    elements.forEach(e => {
        const element = getFolderElement(e);
        if (!element) return;
        const { uuid } = element.dataset;
        if (!uuid) return;
        if (!getHiddenFolders().includes(uuid)) return;
        if (game.user && isAllowedEditor(game.user)) {
            e.classList.add('hide-my-folders-selected-gm')
        }else{
            e.remove();
        }
    });
});

/** @returns {string[]} */
const getHiddenFolders = () => getSettings().get(MOD_NAME, FOLDERS_LIST);
const getEditorRole = () => getSettings().get(MOD_NAME, EDITOR_ROLE);
/** @param {User} user */
const isAllowedEditor = (user) => user.role >= getEditorRole();
/** @param {Element|null} element @returns {FolderElement|null} */
const getFolderElement = element => element instanceof HTMLElement ? element : null;
/** @param {HTMLElement} target @returns {FolderElement|null} */
const getFolder = target => getFolderElement(target.closest('.directory-item.folder'));

Hooks.on("getFolderContextOptions", (_app, menuItems) => {
    menuItems.push({
        label: game.i18n?.localize(`${MOD_NAME}.add`) ?? `${MOD_NAME}.add`,
        icon: '<i class="fa-solid fa-eye-slash"></i>',
        visible: target => {
            const folder = getFolder(target);
            const id = folder?.dataset.uuid;
            const classes = folder?.classList;
            return Boolean(game.user && id && classes?.contains('folder') && isAllowedEditor(game.user) && !getHiddenFolders().includes(id));
        },
        onClick: (_event, target) => {
            const folder = getFolder(target);
            const id = folder?.dataset.uuid;
            if (!id) return;
            getSettings().set(MOD_NAME, FOLDERS_LIST, [...getHiddenFolders(), id]);
        }
    });

    menuItems.push({
        label: game.i18n?.localize(`${MOD_NAME}.remove`) ?? `${MOD_NAME}.remove`,
        icon: '<i class="fa-solid fa-eye"></i>',
        visible: target => {
            const folder = getFolder(target);
            const classes = folder?.classList;
            const id = folder?.dataset.uuid;
            return Boolean(game.user && id && classes?.contains('folder') && isAllowedEditor(game.user) && getHiddenFolders().includes(id));
        },
        onClick: (_event, target) => {
            const folder = getFolder(target);
            const id = folder?.dataset.uuid;
            if (!id) return;
            getSettings().set(MOD_NAME, FOLDERS_LIST, [...getHiddenFolders().filter(f => f != id)]);
        }
    });
});
