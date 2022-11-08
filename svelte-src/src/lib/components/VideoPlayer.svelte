<script lang="ts">
    import Hls from "hls.js"
    import Plyr from "plyr"
	import { onMount } from "svelte";

    export let src = "";
    export let type = "";
    export let episodeId: number;
    export let animeMalId: number;

    function getExtension() {
        let parts = src.split(".");
        return parts.pop();
    }

    async function isExpired(url:string) {
        // add 1080 before extension
        let parts = url.split(".")
        let ext = parts.pop()
        parts.push("1080");
        parts.push(ext??"");
        let newUrl = parts.join(".");
        console.log("newUrl: ", newUrl);
        let xhr = new XMLHttpRequest();
        xhr.open('HEAD', newUrl);
        return new Promise((res, rej) => {
            xhr.onload = () => {
                res(false);
            }
            xhr.onerror = (ev) => {
                res(true)
            }
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
    
    async function initVideoPlayer(): Promise<Plyr> {
        let linkExpired = await isExpired(src);
        console.log("src:", src);
        if (linkExpired) { // get new source 
              let sourceObj = await window.api.renewSource(animeMalId, episodeId);
              src = sourceObj.source;      
        }
        console.log("src:", src);
        console.log("type: ", linkExpired);
        return new Promise((res, _) => {
            const video = document.getElementById("player") as HTMLVideoElement;
            video.onerror = (event, src, line, col, err) => {
                console.log("video error:")
                console.log(err);
            }
        const defaultOptions: { quality?: { default:number, options:number[], forced:boolean, onChange: (num:number) => void} } = {};
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
                let quality = {
                    default: 720,
                    options: availableQualities,
                    // this ensures Plyr to use Hls to update quality level
                    // Ref: https://github.com/sampotts/plyr/blob/master/src/js/html5.js#L77
                    forced: true,        
                    onChange: (e:number) => updateQuality(e),
                }
                // Initialize new Plyr player with quality options
                hls.attachMedia(video);
                const player = new Plyr(video, {
                    quality, 
                    
                });
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

        player.on("error", (err) => {
            console.log("Plyr error:")
            console.log(err)
        });

        let PrevwatchTime = await window.api.getWatchTime(animeMalId, episodeId);
        
        await player.play();
        player.currentTime = PrevwatchTime

        player.on("enterfullscreen", () => {
            window.api.fullscreen(true);
        })

        player.on("exitfullscreen", () => {
            window.api.fullscreen(false);
        })

        player.on("play", () => {
            setInterval(()  => {
            let watchTime = parseInt(player.currentTime.toString());
            window.api.setWatchTime(animeMalId, episodeId, watchTime)
            }, 3500)
        })
    })

    

</script>

<video id="player" controls style="border-radius: 12px;">
    <source src={src} type={type} label="480p">
        <source src={src} type={type} label="720p">
</video>