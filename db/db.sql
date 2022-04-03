-- User
-- DROP Table user;
CREATE Table user(
  username VARCHAR(100) PRIMARY KEY,
  password VARCHAR(100),
  displayName VARCHAR(100),
  isOnline BOOLEAN DEFAULT FALSE
);
INSERT INTO user(displayname,username,password) values('d','dd','d');
INSERT INTO
  user(username, password, `displayName`)
VALUES('anirut1', '1234', 'lonly');
INSERT INTO
  user(username, password, `displayName`)
VALUES('anirut2', '1234', 'lovely');
INSERT INTO
  user(username, password, `displayName`)
VALUES('anirut3', '1234', 'dragon');
INSERT INTO
  user(username, password, `displayName`)
VALUES('anirut4', '1234', 'mm');
UPDATE
  user
SET
  isOnline = true
WHERE
  username = 'anirut';
CREATE Table userOnline(
    socketid VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100),
    FOREIGN KEY (username) REFERENCES user(username)
  );

INSERT INTO userOnline VALUES('aaaaa','anirut');

DELETE FROM userOnline WHERE socketid='aaaaa';



CREATE View onlineDevice AS
SELECT COUNT(username),username
FROM userOnline 
GROUP BY username;

SELECT * FROM `onlineDevice`;

SELECT socketid
FROM userOnline 
WHERE username='anirut4';


CREATE Table chat(
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  content VARCHAR(500),
  sender VARCHAR(100),
  resiver VARCHAR(100),
  time TIMESTAMP,
  FOREIGN KEY(sender) REFERENCES user(username),
  FOREIGN KEY(resiver) REFERENCES user(username)
);

INSERT INTO chat VALUES(null,'hello','anirut4','anirut',UTC_TIMESTAMP());
INSERT INTO chat VALUES(null,"I'm anirut",'anirut','anirut4',UTC_TIMESTAMP());

INSERT INTO chat VALUES(null,"I'm anirut",'anirut','anirut4',20220321201740);

SELECT UTC_TIMESTAMP()+0,UTC_TIME+0;


SELECT * FROM chat;

SELECT * FROM(
  SELECT * FROM chat WHERE sender='anirut' and resiver = 'anirut4'
  UNION
  SELECT * FROM chat WHERE sender='anirut4' and resiver = 'anirut'
) a ORDER BY a.time DESC;




/* ////////////////////////////////////////////////// */

/* CREATE view laseSent AS */
SELECT sender, MAX(id) chatID
FROM chat
GROUP BY sender 
;


/* CREATE view laseResive AS */
SELECT resiver, MAX(id) chatID
FROM chat
GROUP BY resiver
;

/* SELECT *  */
/* FROM ( */
  SELECT *
    FROM `laseSent` s
    LEFT JOIN `laseResive` r
    ON s.chatID=r.chatID
  UNION SELECT *
    FROM `laseSent` s
    RIGHT JOIN `laseResive` r
    ON s.chatID=r.chatID;
/* ); */


SELECT * FROM chat
WHERE sender='anirut'
ORDER BY id DESC;
