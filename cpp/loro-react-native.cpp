// Generated by uniffi-bindgen-react-native
#include "loro-react-native.h"
#include "generated/loro.hpp"

namespace lororeactnative {
	using namespace facebook;

	uint8_t installRustCrate(jsi::Runtime &runtime, std::shared_ptr<react::CallInvoker> callInvoker) {
		NativeLoro::registerModule(runtime, callInvoker);
		return true;
	}

	uint8_t cleanupRustCrate(jsi::Runtime &runtime) {
		return false;
	}
}