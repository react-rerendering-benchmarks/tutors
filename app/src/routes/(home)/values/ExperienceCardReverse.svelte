<script lang="ts">
  import { convertMdToHtml } from "$lib/services/models/markdown-utils";
  export let link = "";
  export let image = "";
  export let title = "";
  export let content = "";
  let contentHtml = convertMdToHtml(content);
</script>

<div class="grid flex-col-reverse items-center grid-cols-1 mb-24 md:grid-cols-2 gap-y-10 md:gap-y-32 gap-x-10 md:gap-x-24">
  <div class="order-none md:order-2">
    <h2 class="mb-4 text-2xl font-extrabold tracking-tight text-center md:leading-tight sm:text-left md:text-4xl">{title}</h2>
    <p class="mb-5 text-base text-center sm:text-left md:text-lg">
      {@html contentHtml}
    </p>
    <a href={link} class="w-full btn variant-filled-primary btn-lg sm:w-auto">Learn More</a>
  </div>
  <div class="w-full h-full">
    <figure class="my-4">
      <img src={image} alt={title} />
    </figure>
  </div>
</div>
