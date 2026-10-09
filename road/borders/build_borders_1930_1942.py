"""Build 1930 and 1942 border layers.
usage: python -I build.py <dl_dir> <out_dir>
Base: aourednik/historical-basemaps world_1930 (GPL-3.0), patched with Natural Earth 10m
admin-0/admin-1 pieces (public domain) and hand-digitised approximate lines (see HAND_* below).
"""
import json, sys, os
sys.stdout.reconfigure(encoding='utf-8')
from shapely.geometry import shape, mapping, Polygon, box, Point
from shapely.ops import unary_union
from shapely import make_valid

DL, OUT = sys.argv[1], sys.argv[2]
def load(n): return json.load(open(os.path.join(DL, n), encoding='utf-8'))
def fix(g):
    g = make_valid(g)
    if g.geom_type == 'GeometryCollection':
        g = unary_union([p for p in g.geoms if p.geom_type in ('Polygon', 'MultiPolygon')])
    import shapely
    return shapely.set_precision(g.buffer(0), 1e-5)

ne0 = {f['properties']['ADM0_A3']: fix(shape(f['geometry'])) for f in load('ne10_adm0.geojson')['features']}
ne1 = {}
for f in load('ne10_adm1.geojson')['features']:
    p = f['properties']
    k = (p['adm0_a3'], p['name'])
    g = fix(shape(f['geometry']))
    ne1[k] = ne1[k].union(g) if k in ne1 else g
def A1(c, *names):
    gs = []
    for n in names:
        if (c, n) not in ne1: raise KeyError((c, n))
        gs.append(ne1[(c, n)])
    return unary_union(gs)
def A1_all(c): return unary_union([g for (cc, n), g in ne1.items() if cc == c])
def LL(pts):  # hand polygons are written as (lat, lon)
    return Polygon([(lo, la) for la, lo in pts])

# ---------------- 1930 base ----------------
RENAME = {
    'White Russia': 'Soviet Union', 'Far Eastern SSR': 'Soviet Union', 'Armenia': 'Soviet Union',
    'Azerbaijan': 'Soviet Union', 'Georgia': 'Soviet Union',
    'United Kingdom of Great Britain and Ireland': 'United Kingdom',
    'Republic of Turkey': 'Turkey', 'Mandatory Palestine (GB)': 'Mandatory Palestine',
    'Mesopotamia (GB)': 'Iraq (British Mandate)', 'Syria (France)': 'Syria and Lebanon (French Mandate)',
    'Libya (IT)': 'Libya (Italian)', 'Danzig': 'Free City of Danzig', 'East Prussia': 'Germany',
    'Dodecanese Islands': 'Italy', 'Madagascar (France)': 'Madagascar (French)',
    'Rwanda (Belgium)': 'Ruanda-Urundi (Belgian)', 'Zaire (Belgium)': 'Belgian Congo',
    'Chinese Warlords': 'China', 'Rattanakosin Kingdom': 'Siam', 'British Raj': 'British India',
    'Empire of Japan': 'Japan', 'Ceylon': 'Ceylon (British)',
}
base = load('world_1930.geojson')['features']
named, unnamed = {}, []
for f in base:
    if not f['geometry']: continue
    g = fix(shape(f['geometry']))
    n = f['properties'].get('NAME')
    if n is None:
        unnamed.append(g); continue
    n = RENAME.get(n, n)
    named[n] = named[n].union(g) if n in named else g
# unnamed islands -> nearest named polygon, with hand overrides
for g in unnamed:
    c = g.representative_point()
    if -8 < c.x < -6 and 61 < c.y < 63: n = 'Denmark'          # Faroe
    elif 19 < c.x < 21 and 59.9 < c.y < 60.6: n = 'Finland'    # Aland
    else:
        n = min(named, key=lambda k: named[k].distance(c))
    named[n] = named[n].union(g)

def safe(op, a, b):
    try:
        return fix(op(a, b))
    except Exception:
        import shapely
        return fix(op(shapely.set_precision(a, 1e-5), shapely.set_precision(b, 1e-5)))

class Map:
    def __init__(s, d): s.f = dict(d)
    def paint(s, name, geom, land_only=False):
        geom = fix(geom)
        if land_only:
            geom = geom.intersection(unary_union(list(s.f.values())))
        for k in list(s.f):
            if k != name and safe(lambda a, b: a.intersection(b), s.f[k], geom).area > 0:
                s.f[k] = safe(lambda a, b: a.difference(b), s.f[k], geom)
        s.f[name] = safe(lambda a, b: a.union(b), s.f[name], geom) if name in s.f else geom
    def rename(s, a, b):
        g = s.f.pop(a)
        s.f[b] = s.f[b].union(g) if b in s.f else g
    def drop_empty(s):
        s.f = {k: v for k, v in s.f.items() if not v.is_empty and v.area > 1e-6}
    def get(s, k): return s.f[k]

m = Map(named)
# --- 1930 corrections (each verified against the source's own errors) ---
# Alsace-Moselle: source draws Germany over Strasbourg (French since 1918/19).
m.paint('France', A1('FRA', 'Bas-Rhin', 'Haute-Rhin', 'Moselle'))
# Irish Free State (1922): source includes it in the UK.
m.paint('Irish Free State', ne0['IRL'])
# Denmark: source lacks Zealand/Funen/Als (Copenhagen not covered).
m.paint('Denmark', ne0['DNK'].intersection(box(7, 54, 16, 58.5)))
# Transjordan: source merges it into the Iraq polygon.
m.paint('Transjordan (British Mandate)', ne0['JOR'])
m.paint('Mandatory Palestine', unary_union([ne0['ISR'], ne0['PSX']]))
m.paint('Syria and Lebanon (French Mandate)', ne0['LBN'])
# Austria/Czechoslovakia overlap at Bratislava: give it to Czechoslovakia.
m.f['Austria'] = m.f['Austria'].difference(m.f['Czechoslovakia'])
# Saudi predecessors -> one label for 1930 ("Hejaz and Nejd")
for k in ('Hejaz', 'Hail', "Emirate of Bin Shal'an"):
    if k in m.f: m.rename(k, 'Kingdom of Hejaz and Nejd')
m.drop_empty()
y1930 = dict(m.f)

# ---------------- 1942 ----------------
m = Map(y1930)
P30 = y1930['Poland']; CS30 = y1930['Czechoslovakia']; RO30 = y1930['Romania']; LT30 = y1930['Lithuania']
for a, b in [('Irish Free State', 'Ireland'), ('Iraq (British Mandate)', 'Iraq'),
             ('Kingdom of Hejaz and Nejd', 'Saudi Arabia'), ('Transjordan (British Mandate)', 'Transjordan (British Mandate)')]:
    m.rename(a, b)

REICH = 'Greater German Reich'
m.rename('Germany', REICH); m.rename('Austria', REICH); m.rename('Free City of Danzig', REICH)

# Protectorate of Bohemia and Moravia: hand-digitised outline of the 1939 Protectorate
# (Bohemia-Moravia minus the Sudetenland), threaded between known towns:
# Protectorate side: Rakovnik, Louny, Roudnice, TEREZIN, Melnik, Turnov, Semily, Dvur Kralove,
# Jaromer, Nachod, Rychnov, Zamberk, Usti n.O., Litomysl, Policka, Litovel, Olomouc, Prerov,
# Moravska Ostrava, Frydek, Brno, Hodonin, Mor. Budejovice, Dacice, J. Hradec, Trebon,
# C. Budejovice, Strakonice, Klatovy, Domazlice, Plzen, Kladno.
# Reich side: Zatec, LITOMERICE, Liberec, Jablonec, Trutnov, Broumov, Kraliky, Lanskroun,
# Svitavy, Mor. Trebova, Zabreh, Sternberk, Novy Jicin, Opava, Breclav, Mikulov, Znojmo,
# Slavonice, Nova Bystrice, C. Velenice, Krumlov, Prachatice, Nyrsko, Horsovsky Tyn, Stribro,
# Tachov, Podborany.
HAND_PROTECTORATE = [
    (50.20, 13.55), (50.38, 13.70), (50.45, 13.95), (50.505, 14.10), (50.524, 14.16),  # Louny..Terezin (Litomerice 50.534,14.13 left out)
    (50.47, 14.35), (50.45, 14.60), (50.55, 14.90), (50.62, 15.12), (50.63, 15.38),
    (50.60, 15.62), (50.50, 15.78), (50.45, 15.98), (50.45, 16.18), (50.38, 16.30),
    (50.20, 16.40), (50.10, 16.48), (49.90, 16.50), (49.80, 16.42), (49.70, 16.40),
    (49.66, 16.60), (49.70, 16.80), (49.73, 17.05), (49.70, 17.20), (49.68, 17.45),
    (49.65, 17.75), (49.55, 17.85), (49.55, 18.08), (49.65, 18.12), (49.78, 18.15),
    (49.88, 18.25), (49.87, 18.40), (49.80, 18.50), (49.65, 18.60), (49.45, 18.90),
    (48.80, 18.00), (48.70, 17.30),   # far east/south: clipped by Czech border
    (48.82, 17.05), (48.85, 16.75), (48.92, 16.55), (48.95, 16.30), (49.00, 16.10),
    (49.05, 15.70), (49.03, 15.40), (49.00, 15.20), (49.06, 15.05), (48.93, 14.75),
    (48.90, 14.50), (48.95, 14.30), (49.03, 14.12), (49.12, 14.05), (49.22, 13.70),
    (49.30, 13.45), (49.36, 13.10), (49.42, 12.88), (49.50, 12.92), (49.55, 13.05),
    (49.62, 13.10), (49.72, 13.00), (49.85, 13.15), (50.00, 13.30), (50.10, 13.40),
]
PROT = LL(HAND_PROTECTORATE).intersection(ne0['CZE'])
CZ_LANDS = ne0['CZE']
# Reich: Czech lands outside the Protectorate (Sudetenland + Hlucin + Zaolzie, annexed 1938-39)
m.paint(REICH, CZ_LANDS.difference(PROT))
m.paint('Protectorate of Bohemia and Moravia', PROT)

# First Vienna Award (Nov 1938) line through southern Slovakia, hand-digitised:
# Hungarian side: Samorin, Galanta, Sala, Nove Zamky, Komarno, Levice, Sahy, Lucenec,
# Filakovo, Rim. Sobota, Roznava, Kosice, Trebisov, Kralovsky Chlmec, V. Kapusany.
# Slovak side: Bratislava, Senec, Sered, Nitra, Krupina, Dobsina, Presov, Michalovce, Sobrance.
HAND_VIENNA1 = [
    (48.10, 17.10), (48.16, 17.38), (48.22, 17.62), (48.24, 17.78), (48.20, 17.95),
    (48.22, 18.20), (48.28, 18.45), (48.27, 18.75), (48.20, 19.00), (48.26, 19.25),
    (48.40, 19.50), (48.42, 19.80), (48.46, 20.05), (48.62, 20.32), (48.74, 20.55),
    (48.78, 20.90), (48.82, 21.20), (48.76, 21.50), (48.69, 21.80), (48.60, 22.05),
    (48.66, 22.20), (48.75, 22.45), (47.40, 22.60), (47.40, 17.00),
]
SK = ne0['SVK']
HU_SK = SK.intersection(LL(HAND_VIENNA1))
m.paint('Slovakia', SK.difference(HU_SK))

# Second Vienna Award (Aug 1940) line: Hungarian side Oradea, Salonta, Huedin, Cluj, Dej,
# Targu Mures, Odorheiu, Miercurea Ciuc, Sf. Gheorghe; Romanian side Arad, Beius, Turda,
# Ludus, Targu Ocna/Tarnaveni, Sighisoara, Brasov.
HAND_VIENNA2 = [
    (46.60, 21.30), (46.70, 21.90), (46.74, 22.30), (46.80, 22.70), (46.75, 23.20),
    (46.66, 23.60), (46.60, 23.90), (46.50, 24.15), (46.42, 24.45), (46.30, 24.80),
    (46.12, 25.10), (45.92, 25.35), (45.76, 25.55), (45.70, 25.90), (45.60, 26.50),
    (48.50, 26.50), (48.50, 21.30),
]
NTRANS = A1('ROU', 'Satu Mare', 'Maramures', 'Salaj', 'Bistrita-Nasaud', 'Harghita', 'Covasna',
            'Cluj', 'Mures', 'Bihor').intersection(LL(HAND_VIENNA2))
BACKA = A1('SRB', 'Severno-Backi', 'Zapadno-Backi', 'Južno-Backi').intersection(LL([(46.3, 18.8), (46.3, 20.4), (45.30, 20.4), (45.20, 19.95), (45.24, 19.5), (45.15, 19.0), (45.4, 18.8)]))  # north of Danube
BARANJA = A1('HRV', 'Osjecko-Baranjska').intersection(LL([(46.0, 18.3), (46.0, 19.0), (45.58, 19.0), (45.58, 18.75), (45.66, 18.3)]))
PREKMURJE = A1('SVN', 'Moravske Toplice', 'Šalovci', 'Hodoš', 'Gornji Petrovci', 'Kuzma', 'Lendava',
               'Dobrovnik', 'Kobilje', 'Rogašovci', 'Cankova', 'Črenšovci', 'Puconci', 'Grad',
               'Murska Sobota', 'Turnišče', 'Velika Polana', 'Beltinci', 'Odranci')
MEDJ = A1('HRV', 'Medimurska')
HU = unary_union([HU_SK, A1('UKR', 'Transcarpathia'), NTRANS, BACKA, BARANJA, PREKMURJE, MEDJ])
m.paint('Hungary', HU)

# Bulgaria: Southern Dobruja (Craiova, 1940); occupied Vardar Macedonia, Greek E. Macedonia & Thrace,
# Pirot & Vranje districts (1941).
W_MKD = A1('MKD', 'Struga', 'Debar', 'Gostivar', 'Tetovo', 'Jegunovce', 'Tearce', 'Bogovinje',
           'Vrapcište', 'Mavrovo and Rostusa', 'Kičevo', 'Zajas', 'Oslomej', 'Vevčani',
           'Centar župa', 'Brvenica', 'Želino', 'Plasnica', 'Vraneštica', 'Drugovo')
m.paint('Bulgaria', unary_union([A1('BGR', 'Dobrich', 'Silistra'), ne0['MKD'].difference(W_MKD),
                                 A1('GRC', 'Anatoliki Makedonia kai Thraki'), A1('SRB', 'Pirotski', 'Pcinjski')]))
# Italian-ruled Albania incl. most of Kosovo and western Macedonia
KOS_SERB = A1('KOS', 'Leposavić', 'Zvečan', 'Zubin Potok', 'Kosovska Mitrovica', 'Vučitrn', 'Podujevo')
m.paint('Albania (Italian)', unary_union([ne0['ALB'], ne0['KOS'].difference(KOS_SERB), W_MKD]))
m.f.pop('Albania', None)
m.paint('Montenegro (Italian-occupied)', ne0['MNE'])
m.paint('Independent State of Croatia', unary_union([ne0['HRV'], ne0['BIH'], A1('SRB', 'Sremski')]).difference(HU))
m.paint('Serbia (German military administration)', unary_union([ne0['SRB'], KOS_SERB]).difference(HU).difference(A1('SRB', 'Sremski', 'Pirotski', 'Pcinjski')))
# Slovenia partition (April 1941)
SVN_PREWAR_ITALY = ['Piran', 'Izola', 'Koper', 'Hrpelje-Kozina', 'Divaca', 'Sežana', 'Komen',
                    'Miren-Kostanjevica', 'Šempeter-Vrtojba', 'Nova Goriška', 'Brda', 'Kanal',
                    'Tolmin', 'Kobarid', 'Bovec', 'Cerkno', 'Idrija', 'Ajdovščina', 'Vipava',
                    'Postojna', 'Pivka', 'Ilirska Bistrica']
SVN_LJUBLJANA_PROV = ['Ljubljana', 'Ig', 'Škofljica', 'Brezovica', 'Dobrova-Polhov Gradec', 'Horjul',
                      'Vrhnika', 'Borovnica', 'Logatec', 'Cerknica', 'Bloke', 'Loška dolina',
                      'Loški Potok', 'Ribnica', 'Sodražica', 'Velike Lašče', 'Dobrepolje',
                      'Grosuplje', 'Ivancna Gorica', 'Žužemberk', 'Trebnje', 'Mirna Pec',
                      'Novo Mesto', 'Šentjernej', 'Škocjan', 'Dolenjske Toplice', 'Semic',
                      'Metlika', 'Crnomelj', 'Kocevje', 'Kostel', 'Dol pri Ljubljani', 'Žiri']
SVN_IT = A1('SVN', *SVN_PREWAR_ITALY, *SVN_LJUBLJANA_PROV)
m.paint('Italy', SVN_IT)
m.paint(REICH, ne0['SVN'].difference(SVN_IT).difference(PREKMURJE))
m.f.pop('Yugoslavia', None)
m.paint('Greece (occupied)', ne0['GRC'].difference(A1('GRC', 'Anatoliki Makedonia kai Thraki')))
m.f.pop('Greece', None)

# Romania 1942: minus N. Transylvania and S. Dobruja; Bessarabia & N. Bukovina retaken 1941.
# Transnistria (Romanian-administered 1941-44) between Dniester and Southern Bug.
HAND_TRANSNISTRIA = [
    (48.45, 27.30), (48.60, 28.30), (48.82, 28.94), (48.67, 29.23), (48.30, 30.10),
    (48.05, 30.86), (47.57, 31.33), (46.97, 32.00), (46.55, 31.95), (46.20, 31.30),
    (45.90, 30.60), (45.60, 29.90), (45.90, 29.00), (47.00, 28.40), (48.00, 27.10),
]
m.paint('Transnistria (Romanian-administered)', LL(HAND_TRANSNISTRIA).difference(RO30), land_only=True)

# Poland 1939-44
# Line A: annexed to the Reich (Danzig-W. Prussia, Wartheland, Zichenau, E. Upper Silesia) vs GG.
# Reich side: Ostroleka, Pultusk, Nowy Dwor, Plock, Kutno, Leczyca, Lodz, Brzeziny, Wielun,
# Klobuck, Zawiercie, Olkusz, Chrzanow, OSWIECIM, Wadowice, Zywiec.
# GG side: Ostrow Maz., Wyszkow, Warsaw, Sochaczew, Lowicz, Rawa, Tomaszow, Piotrkow, Radomsko,
# Czestochowa, Myszkow, Krakow, Krzeszowice, Kalwaria, Sucha.
HAND_ANNEXED_W = [
    (56.0, 21.85), (53.40, 21.85), (53.00, 21.75), (52.80, 21.55), (52.62, 21.20),
    (52.45, 20.85), (52.38, 20.55), (52.30, 20.15), (52.08, 19.85), (51.85, 19.95),
    (51.72, 19.98), (51.52, 19.55), (51.25, 19.25), (51.00, 19.03), (50.80, 19.03),
    (50.60, 19.25), (50.47, 19.55), (50.36, 19.80), (50.20, 19.58), (50.08, 19.52),
    (49.95, 19.58), (49.80, 19.55), (49.60, 19.50), (49.00, 19.45), (49.00, 13.0), (56.0, 13.0),
]
# Bezirk Bialystok (German civil administration, attached to East Prussia, 1941)
HAND_BIALYSTOK = [
    (54.40, 21.85), (53.40, 21.85), (53.00, 21.85), (52.75, 22.20), (52.60, 22.60),
    (52.45, 23.00), (52.38, 23.60), (52.60, 24.30), (52.95, 24.90), (53.30, 24.95),
    (53.65, 24.80), (53.95, 24.40), (54.10, 23.60), (54.40, 23.40),
]
ANNEX = P30.intersection(LL(HAND_ANNEXED_W))
BIAL = P30.intersection(LL(HAND_BIALYSTOK)).difference(ANNEX)
GALICIA = A1('UKR', "L'viv", "Ternopil'", "Ivano-Frankivs'k")
GG = P30.intersection(unary_union([ne0['POL'], GALICIA])).difference(ANNEX).difference(BIAL)
m.paint(REICH, ANNEX)
m.paint('General Government', GG)
m.paint('Bialystok District (German-administered)', BIAL)
# Memelland (to the Reich, March 1939)
HAND_MEMEL = [(55.86, 20.90), (55.86, 21.60), (55.40, 21.80), (55.25, 22.10), (55.08, 22.20), (55.00, 21.00)]
m.paint(REICH, LT30.intersection(LL(HAND_MEMEL)))
# Alsace-Moselle (de facto annexed 1940) and Luxembourg (annexed 1942)
m.paint(REICH, A1('FRA', 'Bas-Rhin', 'Haute-Rhin', 'Moselle'))
m.rename('Luxembourg', REICH)

# Reichskommissariat Ostland: Baltic states + Vilnius region + western/central Belarus
BLR = ne0['BLR']
OST = unary_union([ne0['LTU'], ne0['LVA'], ne0['EST'], y1930['Lithuania'], y1930['Latvia'], y1930['Estonia'],
                   BLR.intersection(box(23.0, 52.45, 28.7, 56.5))]).difference(LT30.intersection(LL(HAND_MEMEL)))
OST = OST.union(P30.difference(GG).difference(ANNEX).difference(BIAL).intersection(box(22, 52.45, 30, 56.5)))
m.paint('Reichskommissariat Ostland', OST.difference(BIAL), land_only=True)
for k in ('Lithuania', 'Latvia', 'Estonia'): m.f.pop(k, None)
# Reichskommissariat Ukraine (extent of late 1942)
RKU = unary_union([A1('UKR', 'Volyn', 'Rivne', 'Zhytomyr', 'Kiev', 'Kiev City', 'Vinnytsya',
                       "Khmel'nyts'kyy", 'Cherkasy', 'Kirovohrad', 'Mykolayiv', "Dnipropetrovs'k",
                       'Zaporizhzhya', 'Kherson', 'Poltava'),
                   BLR.intersection(box(23.0, 51.0, 30.0, 52.45)),
                   P30.difference(GG).difference(ANNEX).difference(BIAL).intersection(box(22, 50.0, 30, 52.45))])
RKU = RKU.difference(m.f['Transnistria (Romanian-administered)']).difference(RO30).difference(GALICIA)
m.paint('Reichskommissariat Ukraine', RKU, land_only=True)

m.drop_empty()
y1942 = dict(m.f)

def dump(d, path, varname, note):
    feats = []
    for n, g in sorted(d.items()):
        if g.geom_type == 'GeometryCollection':
            g = unary_union([x for x in g.geoms if x.geom_type in ('Polygon', 'MultiPolygon')])
        if g.is_empty: continue
        feats.append({'type': 'Feature', 'properties': {'name': n}, 'geometry': mapping(g)})
    fc = {'type': 'FeatureCollection', 'features': feats}
    json.dump(fc, open(path, 'w', encoding='utf-8'))
dump(y1930, os.path.join(OUT, 'raw1930.geojson'), None, None)
dump(y1942, os.path.join(OUT, 'raw1942.geojson'), None, None)
print('1930 features', len(y1930), ' 1942 features', len(y1942))
