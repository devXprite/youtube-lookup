const apiLink =
    "https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBgp3Q7UJ7630cKu0yjXi8c_Dp7mKwAUC8";
var youtubeMetaData, youtubeSearchData;

function YoutubeSearch(x, y, z) {
    $.ajax({
        url: `https://youtube.googleapis.com/youtube/v3/search?part=search&location=unnao&locationRadius=20&maxResults=50&key=AIzaSyBgp3Q7UJ7630cKu0yjXi8c_Dp7mKwAUC8`,
        method: "get",
        beforeSend: function () { },
        success: function (data) { },
        error: function (data) { },
        complete: function (ddata) { },
        dataType: "json",
    });
}

function getYoutubeMetadata(id, y, z) {
    $.ajax({
        url: `${apiLink}&part=snippet,statistics,recordingDetails,status,liveStreamingDetails,localizations,contentDetails,topicDetails&id=${id}`,
        method: "get",
        beforeSend: function () {
            $(".submitBtn").text("Please wait...");
        },
        success: function (data) {
            showYoutubeMetaData(data);
            window.location.href = "#result";
        },
        error: function (data) { },
        complete: function (data) {
            $(".submitBtn").text("Submit");
        },
        dataType: "json",
    });
}

$("#youtubeForm").submit(function (e) {
    e.preventDefault();
    submitUrl();
})

function submitUrl() {
    let inputValue = $("#inputUrl").val();

    try {
        let url = new URL(inputValue);
        let urlSearch = new URL(url).search;
        let UrlParam = new URLSearchParams(urlSearch);

        if (UrlParam.has("v")) {
            getYoutubeMetadata(UrlParam.get("v"));
        } else if (inputValue.includes("youtu.be")) {
            let urlPath = (url.pathname).replace("/", "");
            getYoutubeMetadata(urlPath);
        } else {
            console.log("URL dont't have any v parameter!");
        }
    } catch (error) {
        console.log(error);
    }
}

function showYoutubeMetaData(data) {
    $("#thumbnail").attr("src", data.items[0].snippet.thumbnails.high.url);
    $("#result").show();

    console.log(data);

    if (data.items[0].snippet) {
        $("#channelTitle").html(data.items[0].snippet.channelTitle);
        $("#channelDescription").html(data.items[0].snippet.description);
        $("#channelId").html(data.items[0].snippet.channelId);

        $("#videoTitle").html(data.items[0].snippet.localized.title);
        $("#videoDescription").html(data.items[0].snippet.localized.description);
        $("#videoPublishedAt").html(data.items[0].snippet.publishedAt);

        if (data.items[0].snippet.tags) {
            data.items[0].snippet.tags.forEach((tag) => {
                $("#videoTags").append(`<i class="tags">${tag}</i>`);
            });
        }
        
    } 

    if (data.items[0].statistics) {
        $("#viewCount").html(data.items[0].statistics.viewCount);
        $("#likeCount").html(data.items[0].statistics.likeCount);
        $("#favoriteCount").html(data.items[0].statistics.favoriteCount);
        $("#commentCount").html(data.items[0].statistics.commentCount);
    } else{
        $("#Statistics").addClass("not-available");
    }

    if (data.items[0].status) {
        $("#embeddable").html(data.items[0].status.embeddable);
        $("#license").html(data.items[0].status.license);
        $("#madeForKids").html(data.items[0].status.madeForKids);
        $("#privacyStatus").html(data.items[0].status.privacyStatus);
        $("#publicStatsViewable").html(data.items[0].status.publicStatsViewable);
        $("#uploadStatus").html(data.items[0].status.uploadStatus);
    } else{
        $("#status").addClass("not-available");
    }

    if (data.items[0].contentDetails) {
        $("#caption").html(data.items[0].contentDetails.caption);
        $("#definition").html(data.items[0].contentDetails.definition);
        $("#dimension").html(data.items[0].contentDetails.dimension);
        $("#duration").html(data.items[0].contentDetails.duration);
        $("#licensedContent").html(data.items[0].contentDetails.licensedContent);
        $("#projection").html(data.items[0].contentDetails.projection);
    } else{
        $("#contentDetails").addClass("not-available");
    }

    if (data.items[0].recordingDetails.location) {
        $("#altitude").html(data.items[0].recordingDetails.location.altitude);
        $("#latitude").html(data.items[0].recordingDetails.location.latitude);
        $("#longitude").html(data.items[0].recordingDetails.location.longitude);
    } else{
        $("#geolocationDetails").addClass("not-available");
    }

    if (data.items[0].topicDetails.topicCategories.length > 0) {
        data.items[0].topicDetails.topicCategories.forEach(topic => {
            
            $("#topicDetails ul").append(`<li><a href="${topic}">${topic}</a></li>`);            
        });
    } else {
        $("#topicDetails").addClass("not-available");
    }
}

function formatDuration(duration, includeMs, ignoreTime) {
    const years = duration.years();
    const months = duration.months();
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    const millis = duration.milliseconds();
    const format = [
        years > 0 ? years + " years" : "",
        months > 0 ? months + " months" : "",
        days > 0 ? days + " days" : "",
        !ignoreTime && hours > 0 ? hours + "h" : "",
        !ignoreTime && minutes > 0 ? minutes + "m" : "",
        !ignoreTime && seconds > 0 ? seconds + "s" : "",
        includeMs ? (millis > 0 ? millis + "ms" : "") : "",
    ].join(" ");

    if (format.trim() == "") {
        return "0s";
    }

    return format;
}
