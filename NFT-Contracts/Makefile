.PHONY: clean
clean:
	rm -rf build

.PHONY: build
build:
	mkdir -p build
	cd build && cmake ../ && make
	mv build/dreamoji/dreamoji* .
	rm -rf build/*
	mkdir -p build/dreamoji
	mv dreamoji.abi dreamoji.wasm build/dreamoji/
