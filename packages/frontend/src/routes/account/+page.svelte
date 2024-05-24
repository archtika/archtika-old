<script lang="ts">
  import type { PageServerData } from "./$types";

  export let data: PageServerData;
</script>

<h1>Account</h1>

<p>
  User id: <code>{data.account.id}</code>
</p>
<p>
  Username: <strong>{data.account.username}</strong>
</p>
<p>
  Email: <strong>{data.account.email}</strong>
</p>

<a href="http://localhost:3000/api/v1/account/logout">Logout</a>
