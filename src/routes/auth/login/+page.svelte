<script lang="ts">
  let hoverOnPochita = false;
  let email = "";
  let password = "";
  let confirmPassword = "";

  async function createUser() {}
</script>

<div
  class="w-full h-full bg-[url('https://wallpaperaccess.com/full/538943.jpg')] bg-cover"
>
  <div class="w-full h-full py-10 bg-black bg-opacity-70 backdrop-blur-sm">
    <div class="flex justify-center items-center">
      <div
        style="background-color: #F6ECC9;"
        class="pochita px-8 py-16 rounded-lg"
      >
        <div
          class="bg-[url('https://cdn.dribbble.com/users/223989/screenshots/20079548/media/1878ab5136c89e1913433cda355565fb.png?compress=1&resize=500x500')] w-60 h-60 bg-cover rounded-t-lg p-4"
        />
      </div>
      <form
        class="bg-white w-96 rounded-lg p-6 py-12 flex gap-10 flex-col -mx-4"
      >
        <h1 class="text-center font-bold text-4xl">Register</h1>
        <div>
          <label for="username">Username:</label> <br />
          <input type="text" id="username" required />
        </div>
        <div>
          <label for="password">Password:</label> <br />
          <input type="password" id="password" required />
        </div>
        <div>
          <label for="confirm-password">Confirm Password:</label> <br />
          <input type="password" id="confirm-password" required />
        </div>
        <div>
          Already have an account? <a href="/auth/login">Login</a>
        </div>
        <button class="btn bg-accent accent-font">Register</button>
      </form>
    </div>
  </div>
</div>

<style type="postcss">
  form {
    font-family: "PT Sans Narrow";
    @apply border-2 border-gray-700;
  }

  label {
    @apply text-xl mt-6;
  }

  input {
    @apply border-2 text-xl border-gray-600 rounded-sm px-1 h-12 py-2 w-60;
  }

  button {
    font-family: "Inter";
    @apply text-base;
  }

  a {
    color: blue;
  }
</style>
