"""Servidor local para pré-visualizar a versão estática da Zetsuy2k.

Uso: python landingpage.py
Endereço: http://127.0.0.1:8000

O GitHub Pages publica os arquivos HTML, CSS e JavaScript diretamente; este
servidor Python serve apenas para abrir o projeto localmente.
"""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import webbrowser


SITE_DIRECTORY = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8000
SITE_URL = f"http://{HOST}:{PORT}"


def create_server() -> ThreadingHTTPServer:
    """Cria o servidor apontando para a pasta deste projeto."""
    request_handler = partial(
        SimpleHTTPRequestHandler,
        directory=str(SITE_DIRECTORY),
    )
    return ThreadingHTTPServer((HOST, PORT), request_handler)


def main() -> None:
    try:
        server = create_server()
    except OSError as error:
        print(f"Não foi possível iniciar o site em {SITE_URL}.")
        print(f"Verifique se a porta {PORT} está livre. Detalhe: {error}")
        return

    print(f"Zetsuy2k está disponível em {SITE_URL}")
    print("Para encerrar o servidor, pressione Ctrl+C neste terminal.")

    browser_timer = Timer(1, webbrowser.open_new_tab, args=(SITE_URL,))
    browser_timer.daemon = True
    browser_timer.start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
