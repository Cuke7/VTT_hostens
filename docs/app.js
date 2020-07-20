import { MDCRipple } from '@material/ripple/index';
const ripple = new MDCRipple(document.querySelector('.mdc-button'));


import { MDCIconButtonToggle } from '@material/icon-button';
const selector = '.mdc-button, .mdc-icon-button, .mdc-card__action';
const ripples = [].map.call(document.querySelectorAll(selector), function (el) {
    return new MDCIconButtonToggle(el);
});


import { MDCTopAppBar } from "@material/top-app-bar";
const topAppBar = MDCTopAppBar.attachTo(document.getElementById('app-bar'));
topAppBar.setScrollTarget(document.getElementById('main-content'));
topAppBar.listen('MDCTopAppBar:nav', () => {
    drawer.open = !drawer.open;
});

import { MDCDrawer } from "@material/drawer";
const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));

import { MDCSnackbar } from '@material/snackbar';
const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

//Make it a global variable
window.snackbar = snackbar;
window.drawer = drawer;
