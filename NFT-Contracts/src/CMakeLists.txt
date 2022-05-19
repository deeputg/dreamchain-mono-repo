project(dreamoji)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(EOSIO_WASM_OLD_BEHAVIOR "Off")
find_package(eosio.cdt)

add_contract( dreamoji dreamoji dreamoji.cpp )
target_include_directories( dreamoji PUBLIC ${CMAKE_SOURCE_DIR}/../include )
target_ricardian_directory( dreamoji ${CMAKE_SOURCE_DIR}/../ricardian )
