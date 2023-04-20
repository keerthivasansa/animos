<svelte:head>
  <title>Under Construction</title>
  <script
    async
    src="https://platform.twitter.com/widgets.js"
    charset="utf-8"
  ></script>
</svelte:head>

<main>
  <div class="callout">
    <h1>🏗️ Under Construction</h1>
    <p style="white-space: pre;">
      {"We are working a major revamp of the website and the code. \nWe are going to replace the current site with a faster more stable version.\n\nPlease stay tuned for updates"}
    </p>
    <p>
      Follow me on twitter or join our discord channel to receive latest
      updates.
    </p>
    <div class="btn-wrapper">
      <a
        href="https://twitter.com/keerthivasansa_?ref_src=twsrc%5Etfw"
        class="twitter-follow-button"
        data-show-count="false"
      >
        <button class="btn twitter-btn">Follow</button>
      </a>
      <a href="https://discord.gg/r4wrKApBNw">
        <button class="btn discord-btn">Discord</button>
      </a>
    </div>
  </div>
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    display: flex;
    background-color: black;
    justify-content: center;
    align-items: center;
  }

  .callout {
    padding: 25px 75px;
    border-radius: 12px;
    background-color: rgb(46, 46, 46);
    color: rgb(243, 243, 243);
    display: flex;
    flex-flow: column;
    gap: 16px;
  }

  .btn-wrapper {
    display: flex;
    max-width: 450px;
    width: 100%;
    gap: 12px;
  }

  .btn {
    padding: 8px 24px;
    border-radius: 8px;
    border: 0;
    outline: none;
    color: white;
    cursor: pointer;
    font-weight: 600;
    font-family: "Poppins";
  }

  .twitter-btn {
    background-color: #0088be;
  }

  .discord-btn {
    background-color: #7289da;
  }
</style>
