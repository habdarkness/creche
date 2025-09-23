export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center m-4 h-full">
			<div className="flex flex-col justify-center items-center text-2xl font-bold bg-background p-4 rounded-xl gap-4">
				<h1>Login</h1>
				<input
					type="text"
					placeholder="Usuário"
					className="p-2 rounded text-base font-normal"
				/>
				<input
					type="password"
					placeholder="Senha"
					className="p-2 rounded text-base font-normal"
				/>
				<button className="bg-primary text-white px-4 py-2 rounded hover:scale-105 transition">
					Entrar
				</button>
			</div>
		</div>
	);
}
