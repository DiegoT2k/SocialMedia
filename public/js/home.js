$(document).ready(() => {
    $.get("/api/posts", { followingOnly: false }, results => {
        outputPosts(results, $(".postsContainer"));
    });

    const postTextarea = $("#postTextarea");

    postTextarea.on("input", function() {
      const maxLength = parseInt(postTextarea.attr("maxlength"));
      const currentLength = postTextarea.val().length;
  
      if (currentLength > maxLength) {
        postTextarea.val(postTextarea.val().slice(0, maxLength));
      }
    });
    
})

