<script lang="ts">
  import ExperienceCard from "./ExperienceCard.svelte";

  const title = "Developer Experience";
  const image =
    "https://images.unsplash.com/photo-1484417894907-623942c8ee29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80";
  const link = "https://tutors.dev/course/tutors-reference-manual#tutors-values";
  const content = `
  The **_Developer Experience_** prioritises the specification and implementation of **robust**, 
  **well documented**, **loosely coupled components & services**, integrated into a 
  **coherent toolkit** open to contributions from **diverse skill sets**.
  `;
</script>

<ExperienceCard {title} {image} {link} {content} />
