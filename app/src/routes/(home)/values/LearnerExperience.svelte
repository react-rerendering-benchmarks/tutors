<script lang="ts">
  import ExperienceCard from "./ExperienceCard.svelte";

  const title = "Learner Experience";
  const link = "https://tutors.dev/course/tutors-reference-manual#tutors-values";
  const image =
    "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80";
  const content = `
  The **_Learner Experience_** prioritises web interactions that are **engaging**, **contextual**, 
  **linkable**, **searchable**, **accessible** and **responsive**. In addition the experience 
  should foster a sense of **community** and **connection** among fellow learners.
`;
</script>

<ExperienceCard {title} {image} {link} {content} />
