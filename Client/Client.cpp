#include <winsock2.h>
#include <iostream>
#include <tchar.h>
#include <chrono>
#include <ws2tcpip.h>
#include <tchar.h>
#pragma comment(lib, "ws2_32.lib")

using namespace std;

// Servers config
const char* ServerIPFirst = "127.0.0.1";
const u_short ServerPortFirst = 1111;

const char* ServerIPSecond = "127.0.0.2";
const u_short ServerPortSecond = 3000;

// Check if connection is exist
bool IsExistConnectServerFirst = false;
bool IsExistConnectServerSecond = false;

HANDLE ClientCanStartWork1 = CreateEvent(NULL, FALSE, FALSE, (LPWSTR)"ClientCanStartWork1");
HANDLE ClientCanStartWork2 = CreateEvent(NULL, FALSE, FALSE, (LPWSTR)"ClientCanStartWork2");

string warn = "WARNING: ";

/* Create connection to the server */
void CreateConnection(int ServerNumber) {
	// Address structure & set address data with server number
	SOCKADDR_IN addr;
	addr.sin_family = AF_INET;
	inet_pton(AF_INET, ServerNumber == 1 ? ServerIPFirst : ServerIPSecond, &addr.sin_addr.s_addr);
	addr.sin_port = ServerNumber == 1 ? htons(ServerPortFirst) : htons(ServerPortSecond);

	// Create socket
	SOCKET Connection = socket(AF_INET, SOCK_STREAM, NULL);

	// Create connection & handler error state
	if (connect(Connection, (SOCKADDR*)&addr, sizeof(addr)) != 0) {
		return;
	}

	//для того, чтобы нельзя было сделать повторное подключение
	if (ServerNumber == 1) {
		IsExistConnectServerFirst = true;
	} else {
		IsExistConnectServerSecond = true;
	}

	char msg[256];

	// Reading message
	while (true) {
		if (recv(Connection, msg, sizeof(msg), NULL) == SOCKET_ERROR) {
			break;
		}

		cout << msg << "\n" << endl;
	}
}

/* Client console command handler */
void ClientHandler() {
	int number;
	cin >> number;

	if (number == 1) {
		if (!IsExistConnectServerFirst) {
			CreateThread(NULL, NULL, (LPTHREAD_START_ROUTINE)CreateConnection, (LPVOID)(1), NULL, NULL);
		} else {
			cout << warn << "Can't reconnect to server\n";
		} 

		ClientHandler();
	} else if (number == 2) {
		if (!IsExistConnectServerSecond) {
			CreateThread(NULL, NULL, (LPTHREAD_START_ROUTINE)CreateConnection, (LPVOID)(2), NULL, NULL);
		} else {
			cout << warn << "Can't reconnect to server\n";
		}

		ClientHandler();
	} else {
		ClientHandler();
	}
}

void showNavigationMenu() {
	string navigationMessage =
		"Press key 1 for connection to first server.\n"
		"This server will send information such as\n"
		"- Priority of the server process\n"
		"- Identifier and descriptor of the server process\n\n"
		"Press key 2 for connection to second server\n"
		"This server will send information such as\n"
		"- Current keyboard layout code\n"
		"- OS version\n\n";

		// copy(navigationMessage.begin(), navigationMessage.end(), ostream_iterator<char>(cout, ""));

		cout << navigationMessage;
}


int main(int argc, char* argv[]) {
	// Set RU Locale
	setlocale(LC_ALL, "Russian");

	// Load neccessary library
	WSAData wsaData;
	WORD DLLVersion = MAKEWORD(2, 1);
	if (WSAStartup(DLLVersion, &wsaData) != 0) {
		cout << "Error" << endl;
		exit(1);
	}

	// Startup navigation
	cout << "CLIENT HAS STARTED\n";
	showNavigationMenu();
	ClientHandler();

	system("pause");
	return 0;
}



