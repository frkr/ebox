DROP TABLE IF EXISTS boxes;
CREATE TABLE IF NOT EXISTS boxes (
    box TEXT,
    owner TEXT,
    name TEXT,
    tag TEXT,
    tag2 TEXT,
    corpName TEXT,
    email TEXT,
    segm TEXT,
    sent INTEGER
);

CREATE INDEX IF NOT EXISTS idx_boxes ON boxes(box);
CREATE INDEX IF NOT EXISTS idx_owner ON boxes(box,owner);
CREATE INDEX IF NOT EXISTS idx_resol ON boxes(box,owner,email);
CREATE INDEX IF NOT EXISTS sent ON boxes(sent);

INSERT INTO boxes (box,owner,name,tag,tag2,corpName,email,segm) VALUES
('cdi','davimesquita@gmail.com','Davi Saranszky Mesquita','davi','','Casa','davimesquita@gmail.com','Tecnologia')
