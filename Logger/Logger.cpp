#include <winsock2.h>
#include <iostream>
#include <string>
#include <ctime>
#include <chrono>
#include <thread>
#include <fstream>
#pragma comment(lib, "ws2_32.lib")

using namespace std;

HANDLE hEvent1, hEvent2;
HANDLE hPipe1, hPipe2;

// Запись входящего сообщения с помощью логгера
void WriteMessage(string message, string fileName) {
	ofstream out;
	out.open(fileName, ios::app);

	if (out.is_open()) {
		out << message.c_str() << "\n";
		//cout << "Записано сообщение " << message.c_str() << " в файл " << fileName;
		out.close();
	} else {
		cout << "Не удается открыть файл лога\n";
	}
}

void ServerHandler(string serverNumber, string fileName, HANDLE pipe, HANDLE event) {
	DWORD dwRead;

	while (true) {
		//создание канала
		pipe = CreateNamedPipe(
			L"\\\\.\\pipe\\ServerLog1",
			PIPE_ACCESS_DUPLEX,//дввнаправленность
			PIPE_TYPE_MESSAGE | PIPE_READMODE_MESSAGE//данные записываются в канал как поток сообщений 
			| PIPE_WAIT,// Синхронное выполнение операций с каналом
			PIPE_UNLIMITED_INSTANCES,//количество экземпляров канала, ограничено только доступностью системных ресурсов
			0,// Количество байтов, которые нужно зарезервировать для выходного буфера
			0, //Количество байтов, которые нужно зарезервировать для выходного буфера
			NMPWAIT_USE_DEFAULT_WAIT,//Значение времени ожидания по умолчанию
			NULL// Без дополнительных атрибутов безопасности
		);

		if (pipe != INVALID_HANDLE_VALUE) {
			break;
		}
	}

	SetEvent(event);
	cout << "Channel for Server #" << serverNumber << " is created\n";


	while (true) {
		if (ConnectNamedPipe(pipe, NULL) != FALSE) {
			break;
		}
	}

	//чтение сообщений 
	while (true) {
		char msg[1024];

		if (ReadFile(pipe, msg, sizeof(msg) - 1, &dwRead, NULL) != FALSE) {
			//cout << "Получение сообщения от первого сервера. Будет записано в лог\n";
			string text = msg;
			WriteMessage(text, fileName);
		} else {
			//std::cout << "Чтение не осуществлено";
		}
	}

	//std::cout << "Закрытие канала";
	//DisconnectNamedPipe(hPipe);
}

void HandlerForFirst() {
	ServerHandler("1", "C:\\Users\\ignat\\Desktop\\logger#1.txt", hPipe1, hEvent1);
};

void HandlerForSecond() {
	ServerHandler("2", "C:\\Users\\ignat\\Desktop\\logger#2.txt", hPipe2, hEvent2);
};

int main(int argc, char* argv[]) {
	// Set RU Locale
	setlocale(LC_ALL, "Russian");

	//создется мьютекс, которым уже завладевают
	HANDLE hMutex = CreateMutex(NULL, TRUE, L"Mutex3");
	//если пытаются открыть несколько экземпляров сервера, то они не работают и закрываются
	if (GetLastError() == ERROR_ALREADY_EXISTS) {
		exit(0);
	}

	//события о создании каналов
	hEvent1 = CreateEvent(NULL, FALSE, FALSE, (LPWSTR)"CreatePipe1Event");
	hEvent2 = CreateEvent(NULL, FALSE, FALSE, (LPWSTR)"CreatePipe2Event");

	cout << "LOGGER\n" << "Creating channels in process...\n\n";

	// Create thread for every channel
	thread t1(HandlerForFirst);
	thread t2(HandlerForSecond);
	t1.join();
	t2.join();

	system("pause");
	return 0;
}