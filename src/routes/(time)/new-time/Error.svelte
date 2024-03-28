<script lang="ts">
    export let message: string;
  </script>
  
  <div class="error-message">
    <p>{message}</p>
  </div>
  
  <style>
    .error-message {
      color: red;
      background-color: #ffcccc;
      padding: 10px;
      border-radius: 5px;
    }
  </style>