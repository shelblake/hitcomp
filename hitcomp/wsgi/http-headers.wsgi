import json

CONTENT_LEN_HEADER_NAME = "Content-Length"
CONTENT_TYPE_HEADER_NAME = "Content-Type"

REQ_HEADERS = {
    "HTTP_ACCEPT_LANGUAGE": "Accept-Language"
}
RESP_STATUS_OK = "200 OK"

JSON_CONTENT_TYPE = "application/json"
JSON_ENC = json.JSONEncoder(indent=4)


def application(environ, start_response):
    resp_content = {}

    for req_header_env_var_name in REQ_HEADERS.keys():
        if req_header_env_var_name in environ:
            resp_content[REQ_HEADERS[req_header_env_var_name]] = environ[req_header_env_var_name]

    resp_content = JSON_ENC.encode(resp_content)

    resp_headers = [
        (CONTENT_LEN_HEADER_NAME, str(len(resp_content))),
        (CONTENT_TYPE_HEADER_NAME, JSON_CONTENT_TYPE)
    ]

    start_response(RESP_STATUS_OK, resp_headers)

    return [resp_content]
