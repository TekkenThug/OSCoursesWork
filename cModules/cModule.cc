#include <windows.h>
#include <node.h>
#include <winuser.h>
#include <iostream>
#include <string>
#include <sstream>

namespace cModule {
    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Object;
    using v8::Number;
    using v8::String;
    using v8::Value;

    TCHAR Buffer[50];

    void getKeyboardCodeService() {
        GetKeyboardLayoutName(Buffer);
    }

    void getKeyboardCode(const FunctionCallbackInfo<Value>&args) {
        Isolate* isolate = args.GetIsolate();

        DWORD ThreadID;

        HANDLE thread = CreateThread(
            NULL,
            0,
            (LPTHREAD_START_ROUTINE) getKeyboardCodeService,
            NULL,
            0,
            &ThreadID);

        WaitForSingleObject(thread, INFINITE);

        args.GetReturnValue().Set(String::NewFromUtf8(isolate, Buffer).ToLocalChecked());
    }

    void getProcessDescriptor(const FunctionCallbackInfo<Value>&args) {
        Isolate* isolate = args.GetIsolate();

        HANDLE serverHandle = GetCurrentProcess();
        DWORD dwProcessID = GetProcessId(serverHandle);

        std::stringstream processStream;
        HANDLE handleProcessDescriptor = OpenProcess(PROCESS_ALL_ACCESS, TRUE, dwProcessID);
        processStream << handleProcessDescriptor;

        std::string value = processStream.str();

        args.GetReturnValue().Set(String::NewFromUtf8(isolate, value.c_str()).ToLocalChecked());
    }

    void Initialize(Local<Object> exports) {
        NODE_SET_METHOD(exports, "getKeyboardCode", getKeyboardCode);
        NODE_SET_METHOD(exports, "getProcessDescriptor", getProcessDescriptor);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize);
}