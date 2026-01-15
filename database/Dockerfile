FROM mariadb

ENV MARIADB_ALLOW_LOCAL_INFILE=1

COPY ./scripts/01-setup.sql /docker-entrypoint-initdb.d/
COPY ./scripts/init.sh /docker-entrypoint-initdb.d/
COPY ./dataset/initDataset.csv /docker-entrypoint-initdb.d/

RUN chmod +x /docker-entrypoint-initdb.d/init.sh
RUN chmod 644 /docker-entrypoint-initdb.d/initDataset.csv