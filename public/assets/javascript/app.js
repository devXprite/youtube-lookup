var youtubeMetaData, youtubeSearchData;

Waves.init();
AOS.init();
Waves.attach(".section, .tags", ["waves-block", "waves-float", "waves-light"]);
Waves.attach(".img.wrap");
new ClipboardJS(".tags");

const getYoutubeMetadata = (videoID) => {
  $.ajax({
    url: `http://localhost:3000/api/video/${videoID}`,
    method: "get",
    beforeSend: () => {
      $(".please_wait").show();
      $(".fa-spinner").css("display", "block");
      $(".result").hide();
      $(".fa-search").hide();
      $(".submit.btn").prop("disabled", true);
      $("#input-url").prop("disabled", true);
    },
    success: (data) => {
      showYoutubeMetaData(data);
      window.location.href = "#result";
    },
    error: (jqXHR, textStatus, errorThrown) => {
      handleAjaxError(jqXHR, textStatus, errorThrown);
    },
    complete: () => {
      $(".submit.btn").prop("disabled", false);
      $("#input-url").prop("disabled", false);
      $(".fa-search").show();
      $(".fa-spinner").hide();
      $(".please_wait").hide();
    },
    dataType: "json",
  });
};

const checkForClipbordUrl = async () => {
  let clipbaordPermission = await navigator.permissions.query({
    name: "clipboard-read",
    allowWithoutGesture: false,
  });

  console.log(clipbaordPermission.state);

  if (clipbaordPermission.state == "granted") {
    navigator.clipboard
      .readText()
      .then((text) => {
        if (text.includes("youtu") && text != $("#input-url").val()) {
          console.log("Automatic get URL from clipboard!");
          $("#input-url").val(text);
          submitUrl(text);
        }
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  } else if (clipbaordPermission.state == "prompt") {
    navigator.clipboard.readText();
  }
};

const submitUrl =(data) => {
  let inputValue = data || $("#input-url").val();

  try {
    let url = new URL(inputValue);
    let urlSearch = new URL(url).search;
    let UrlParam = new URLSearchParams(urlSearch);

    if (UrlParam.has("v")) {
      getYoutubeMetadata(UrlParam.get("v"));
    } else if (inputValue.includes("youtu.be")) {
      let urlPath = url.pathname.replace("/", "");
      getYoutubeMetadata(urlPath);
    } else {
      console.log("URL dont't have any v parameter!");
    }
  } catch (error) {
    console.log(error);
  }
}

const showYoutubeMetaData = (data) => {
  $("#thumbnail").attr("src", data.snippet.thumbnails[0].url);
  
  $("#thumbnails > div").html("");
  $("#topicDetails > ul").html("");
  $("#videoTags").html("");

  for (let i = 0; i <= 3; i++) {
    $("#thumbnails > div").append(
      `<img src="${data.snippet.thumbnails[i].url}" />`
    );
  }

  $("#result").show();
  console.log(data);

  if (data.snippet) {
    $("#channelTitle").html(data.snippet.channelTitle);
    $("#channelDescription").html(data.snippet.description);
    $("#channelId").html(data.snippet.channelId);

    $("#videoTitle").html(data.snippet.localized.title);
    $("#videoDescription").html(data.snippet.localized.description);
    $("#videoPublishedAt").html(data.snippet.publishedAt);

    if (data.snippet.tags) {
      data.snippet.tags.forEach((tag) => {
        $("#videoTags").append(
          `<i class="tags" data-clipboard-text="${tag}" >${tag}</i>`
        );
      });
      tippy(".tags", { content: "Copied !", animation: "shift-away" });
    }
  }

  if (data.statistics) {
    $("#viewCount").html(data.statistics.viewCount);
    $("#likeCount").html(data.statistics.likeCount);
    $("#favoriteCount").html(data.statistics.favoriteCount);
    $("#commentCount").html(data.statistics.commentCount);
  } else {
    $("#Statistics").addClass("not-available");
  }

  if (data.status) {
    $("#embeddable").html(data.status.embeddable);
    $("#license").html(data.status.license);
    $("#madeForKids").html(data.status.madeForKids);
    $("#privacyStatus").html(data.status.privacyStatus);
    $("#publicStatsViewable").html(data.status.publicStatsViewable);
    $("#uploadStatus").html(data.status.uploadStatus);
  } else {
    $("#status").addClass("not-available");
  }

  if (data.contentDetails) {
    $("#caption").html(data.contentDetails.caption);
    $("#definition").html(data.contentDetails.definition);
    $("#dimension").html(data.contentDetails.dimension);
    $("#duration").html(data.contentDetails.duration);
    $("#licensedContent").html(data.contentDetails.licensedContent);
    $("#projection").html(data.contentDetails.projection);
  } else {
    $("#contentDetails").addClass("not-available");
  }

  if (data.recordingDetails.location) {
    $("#altitude").html(data.recordingDetails.location.altitude);
    $("#latitude").html(data.recordingDetails.location.latitude);
    $("#longitude").html(data.recordingDetails.location.longitude);
  } else {
    $("#geolocationDetails").addClass("not-available");
  }

  if (data.topicDetails.topicCategories.length > 0) {
    data.topicDetails.topicCategories.forEach((topic) => {
      $("#topicDetails ul").append(`<li><a href="${topic}">${topic}</a></li>`);
    });
  } else {
    $("#topicDetails").addClass("not-available");
  }

  $("#share-url").val(`${window.location.origin}${window.location.pathname}?id=${data.id}`);
}

const handleAjaxError = async (jqXHR, textStatus, errorThrown) => {
  switch (jqXHR.status) {
    case 404:
      Swal.fire("Error 404", "Video Not Found", "warning");
      break;
    case 429:
      Swal.fire(
        "Error 429",
        "We're sorry, but you have sent too many requests to us recently. Please try again later. That's all we know",
        "warning"
      );
      break;
    case 400:
      Swal.fire("Error 400", "Invalid URL", "warning");
      break;
    case 500:
      Swal.fire(
        "Error 500",
        "Apparentily something went wrong on the server's side. Please try again later. That's all we know.",
        "warning"
      );
      break;
    default:
      Swal.fire(
        "Unexpected Error",
        "Unknown error occurred while processing your request. Please try again.",
        "warning"
      );
  }
};



$("#youtubeForm").submit(function (e) {
  e.preventDefault();
  submitUrl();
});

window.onload = () =>{
  try {
    let url = new URL(window.location.href);
    let urlSearch = new URL(url).search;
    let UrlParam = new URLSearchParams(urlSearch);

    if (UrlParam.has("id")) {
      getYoutubeMetadata(UrlParam.get("id"));
    }
  } catch (error) {
    
  }
  
}

setInterval(() => {
  checkForClipbordUrl();
}, 5000);
