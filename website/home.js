import {MDCDrawer} from "@material/drawer";
const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));

//import {MDCRipple} from '@material/ripple';
//new MDCRipple(document.querySelector('.cancel'));
//new MDCRipple(document.querySelector('.next'));

import {MDCTopAppBar} from '@material/top-app-bar';

// Instantiation
const topAppBarElement = document.querySelector('.mdc-top-app-bar');
const topAppBar = new MDCTopAppBar(topAppBarElement);