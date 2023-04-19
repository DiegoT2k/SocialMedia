$(document).ready(() => {
    $.get("/api/position", results => {
        outputPosition(results, $(".postsContainer"));
    })
})