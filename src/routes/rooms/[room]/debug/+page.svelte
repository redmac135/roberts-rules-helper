<main>
	<form method="post" action="?/deleteUserData">
		<button>Delete all member status info</button>
	</form>
	<form method="post" action="?/deactivateRooms">
		<button>Deactivate All Rooms</button>
	</form>
</main>

<style>
	main {
		display: flex;
		height: 100vh;
		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;
	}

	form {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
