
//=require ../../node_modules/bootstrap/dist/js/bootstrap.bundle.js

//=require utils.js

document.addEventListener('DOMContentLoaded', (event) => {
    console.debug(event);

    // Init popovers
    let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    let popoverList = popoverTriggerList.map((popoverTriggerEl) => {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    console.debug(popoverList);

    // Init tooltips
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    let tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    console.debug(tooltipList);

});

// =require include/header.js
