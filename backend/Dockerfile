FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y g++ default-jdk && \
    rm -rf /var/lib/apt/lists/*


WORKDIR /app/code

COPY run.sh /run.sh

RUN chmod +x /run.sh

# Set the entry point
ENTRYPOINT ["/run.sh"]
