<script lang="ts">
  import ExperienceCardReverse from "./ExperienceCardReverse.svelte";

  const image =
    "https://images.unsplash.com/photo-1511629091441-ee46146481b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80";
  const title = "Educator Experience";
  const link = "https://tutors.dev/course/tutors-reference-manual#tutors-values";
  const content = `
  The **_Educator Experience_** prioritises the creation of a **guided paths** through a curriculum 
  via the creation of learning materials that are **autonomous**, **structurally aligned**, **composable**, 
  **auditable**, **extensible**, **versioned** and **independent**.
  `;
</script>

<ExperienceCardReverse {title} {image} {link} {content} />
