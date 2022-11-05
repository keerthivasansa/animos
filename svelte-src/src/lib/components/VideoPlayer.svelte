<script lang="ts">
    import Hls from "hls.js"
    import Plyr from "plyr"
	import { onMount } from "svelte";

    export let src = "";
    export let type = "";

    function getExtension() {
        let parts = src.split(".");
        return parts.pop();
    }

    function getMime():Promise<string> {
        let xhr = new XMLHttpRequest();
        xhr.open('HEAD', src, true);
        return new Promise((res, rej) => {
            xhr.onload = function() {
                var contentType = xhr.getResponseHeader('Content-Type');
                if (contentType) {
                    xhr.abort();
                    res(contentType);
                } else rej("Failed to get the content type")
            };
            xhr.send();
        })
        
    }

    function updateQuality(newQuality:number) {
        window.hls.levels.forEach((level:any, levelIndex:number) => {
            if (level.height === newQuality) {
                console.log("Found quality match with " + newQuality);
                window.hls.currentLevel = levelIndex;
            }
        });
    }
    
    function initVideoPlayer(): Promise<Plyr> {
        return new Promise((res, rej) => {
            const video = document.getElementById("player") as HTMLVideoElement;
        const defaultOptions = {};
        if (Hls.isSupported() && getExtension() == "m3u8") {
            const hls = new Hls();
            hls.loadSource(src);
            // From the m3u8 playlist, hls parses the manifest and returns
            // all available video qualities. This is important, in this approach,
            // we will have one source on the Plyr player.
            hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                console.log("parsed")
                // Transform available levels into an array of integers (height values).
                const availableQualities = hls.levels.map((l) => l.height)
                // Add new qualities to option
                defaultOptions.quality = {
                    default: 720,
                    options: availableQualities,
                    // this ensures Plyr to use Hls to update quality level
                    // Ref: https://github.com/sampotts/plyr/blob/master/src/js/html5.js#L77
                    forced: true,        
                    onChange: (e:number) => updateQuality(e),
                }
                // Initialize new Plyr player with quality options
                hls.attachMedia(video);
                const player = new Plyr(video, defaultOptions);
                res(player)
            });
            window.hls = hls;
        } else {
            const player = new Plyr(video, defaultOptions);
            res(player);
        }
        })
    }

    onMount(async () => {
        
        // default options with no quality update in case Hls is not supported
        
        let player = await initVideoPlayer();

        player.on("enterfullscreen", () => {
            window.api.fullscreen(true);
        })

        player.on("exitfullscreen", () => {
            window.api.fullscreen(false);
        })
        
    })

</script>

<video id="player" controls style="border-radius: 12px;">
    <source src={src} type={type} label="480p">
        <source src={src} type={type} label="720p">
</video>